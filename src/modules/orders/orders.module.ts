import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { PrismaModule } from '../../infra/prisma/prisma.module.js';
import { StripeModule } from '../../infra/payments/stripe.module.js';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  imports: [PrismaModule, StripeModule]
})
export class OrdersModule {}
