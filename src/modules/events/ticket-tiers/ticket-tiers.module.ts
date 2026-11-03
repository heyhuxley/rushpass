import { Module } from '@nestjs/common';
import { TicketTiersService } from './ticket-tiers.service.js';
import { TicketTiersController } from './ticket-tiers.controller.js';
import { PrismaModule } from '../../../infra/prisma/prisma.module.js';

@Module({
  controllers: [TicketTiersController],
  providers: [TicketTiersService],
  imports: [PrismaModule]
})
export class TicketTiersModule {}
