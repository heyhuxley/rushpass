import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(
    data: Prisma.OrderCreateInput, orderItems: Prisma.OrderItemCreateManyInput
  ) {
    const order = await this.prisma.$transaction([
      // this.prisma.order.create({
      //   data: data
      // }),
      // this.prisma.ticketTier
    ]);
  }
}
