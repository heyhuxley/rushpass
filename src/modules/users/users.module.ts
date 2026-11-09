import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { PrismaModule } from '../../infra/prisma/prisma.module.js';
import { StripeModule } from '../../infra/payments/stripe.module.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [PrismaModule, StripeModule],
  exports: [UsersService],
})
export class UsersModule {}
