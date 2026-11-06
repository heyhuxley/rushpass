import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Cron, CronExpression } from '@nestjs/schedule';

interface OrderItem {
  ticketTierId: string;
  quantity: number;
  unitPrice: number;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private generateRef(prefix: string = 'ref') {
    const timestamp = Date.now().toString(36);

    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const randomStr = randomArray[0].toString(36).substring(0, 5);

    return `${prefix}-${timestamp}-${randomStr}`.toUpperCase();
  }

  async create(userId: string, orderItems: CreateOrderDto) {
    const ids = orderItems.items.map((item) => item.ticketTierId);

    return this.prisma.$transaction(async (tx) => {
      const tiers = await tx.ticketTier.findMany({
        where: {
          id: { in: ids },
        },
        include: {
          event: true,
        },
      });

      if (tiers.length !== new Set(ids).size) {
        throw new BadRequestException('One or more ticket tiers do not exist.');
      }

      const event = tiers[0].event;
      if (tiers.some((tier) => tier.eventId !== event.id)) {
        throw new BadRequestException(
          'All ticket tiers must belong to the same event.',
        );
      }

      if (event.status !== 'PUBLISHED' || event.startTime <= new Date()) {
        throw new BadRequestException(
          'This event is not available for booking',
        );
      }

      const byId = new Map(tiers.map((tier) => [tier.id, tier]));
      let totalPrice = 0;

      const items = orderItems.items.map(async ({ ticketTierId, quantity }) => {
        const tier = byId.get(ticketTierId);
        if (!tier) {
          throw new BadRequestException('Invalid ticket tier specified.');
        }

        const unitPrice = Number(tier.price);
        totalPrice += unitPrice * quantity;

        const updated = await tx.ticketTier.updateMany({
          where: {
            id: ticketTierId,
            available: {
              gte: quantity,
            },
          },
          data: {
            available: {
              decrement: quantity,
            },
          },
        });

        if (updated.count === 0) {
          throw new BadRequestException(
            `Not enough tickets available for tier ${tier.name}.`,
          );
        }

        return { ticketTierId, quantity, unitPrice };
      });
      const itemsToCreate: OrderItem[] = await Promise.all(items);

      const reference = this.generateRef();

      return tx.order.create({
        data: {
          userId,
          totalPrice,
          reference,
          expiresAt: event.startTime,
          orderItems: {
            createMany: {
              data: itemsToCreate,
            },
          },
        },
        include: {
          orderItems: true,
        },
      });
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cancelPendingOrders() {
    const result = await this.prisma.order.updateMany({
      where: {
        expiresAt: {
          gte: new Date(),
        },
        paidAt: null,
      },
      data: {
        status: 'EXPIRED',
      },
    });
  }
}
