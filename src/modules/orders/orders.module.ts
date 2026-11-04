import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { PrismaModule } from '../../infra/prisma/prisma.module.js';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  imports: [PrismaModule]
})
export class OrdersModule {}
