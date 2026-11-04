import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, orderItems: CreateOrderDto) {
    const ids = orderItems.items.map((item) => item.ticketTierId);

    const tiers = await this.prisma.ticketTier.findMany({
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
      throw new BadRequestException('This event is not available for booking');
    }

    const byId = new Map(tiers.map((tier) => [tier.id, tier]));
    let totalPrice = 0;
    const items = orderItems.items.map(({ ticketTierId, quantity }) => {
      const unitPrice = byId.get(ticketTierId)?.price;
      if (!unitPrice) {
        throw new BadRequestException('Invalid ticket price specified.');
      }

      totalPrice += Number(unitPrice) * quantity;

      return {
        ticketTierId,
        quantity,
        unitPrice,
      };
    });

    return this.prisma.order.create({
      data: {
        userId,
        totalPrice,
        orderItems: {
          createMany: {
            data: items,
          },
        },
      },
      include: {
        orderItems: true,
      },
    });
  }
}
