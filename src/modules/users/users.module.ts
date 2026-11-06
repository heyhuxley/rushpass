import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { PrismaModule } from '../../infra/prisma/prisma.module.js';
import { PaystackModule } from '../../infra/payments/paystack.module.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule, PaystackModule],
  exports: [UsersService],
})
export class UsersModule {}
