import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StripeClient } from '../../infra/payments/stripe.client.js';
import { Prisma } from '../../generated/prisma/client.js';

interface OrderItem {
  ticketTierId: string;
  quantity: number;
  unitPrice: number;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeClient,
  ) {}

  private generateRef(prefix: string = 'ref') {
    const timestamp = Date.now().toString(36);

    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const randomStr = randomArray[0].toString(36).substring(0, 5);

    return `${prefix}-${timestamp}-${randomStr}`.toUpperCase();
  }

  async create(userId: string, orderItems: CreateOrderDto) {
    const ids = orderItems.items.map((item) => item.ticketTierId);

    const { order, event, tiers, reference } = await this.prisma.$transaction(
      async (tx) => {
        const tiers = await tx.ticketTier.findMany({
          where: {
            id: { in: ids },
          },
          include: {
            event: true,
          },
        });

        if (tiers.length !== new Set(ids).size) {
          throw new BadRequestException(
            'One or more ticket tiers do not exist.',
          );
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

        const itemsToCreate = await Promise.all(
          orderItems.items.map(async ({ ticketTierId, quantity }) => {
            const tier = byId.get(ticketTierId);
            if (!tier) {
              throw new BadRequestException('Invalid ticket tier specified.');
            }

            const unitPrice = Number(tier.price);
            totalPrice += unitPrice * quantity; // Fixed syntax error here too!

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
          }),
        );

        const reference = this.generateRef();

        const order = await tx.order.create({
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

        return { order, event, tiers, totalPrice, reference };
      },
    );

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const appUrl = 'http://localhost:3000/api';

    const { url } = await this.stripe.createCheckoutSession({
      orderId: order.id,
      reference: reference,
      email: user.email,
      currency: tiers[0].currency,
      lines: order.orderItems.map((item, i) => ({
        name: `${tiers[i].name} – ${event.title}`,
        unitAmount: Number(item.unitPrice),
        quantity: item.quantity,
      })),
      successUrl: `${appUrl}/orders/${order.id}/status?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/orders/${order.id}/cancelled`,
    });

    return { orderId: order.id, checkoutUrl: url };
  }

  async getOrderStatus(orderId: string, sessionId: string) {
    const status = await this.stripe.fulfillCheckout(sessionId);
    if (!status) throw new BadRequestException('Order not confirmed.');
    try {
      return await this.prisma.order.update({
        where: {
          id: orderId,
          paidAt: null,
        },
        data: {
          paidAt: new Date(),
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new HttpException("Couldn't update order", HttpStatus.NOT_MODIFIED)
      }
      throw err;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cancelPendingOrders() {
    return await this.prisma.order.updateMany({
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
