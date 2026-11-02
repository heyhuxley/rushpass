import { Module } from '@nestjs/common';
import { TicketTiersService } from './ticket-tiers.service.js';
import { TicketTiersController } from './ticket-tiers.controller.js';

@Module({
  controllers: [TicketTiersController],
  providers: [TicketTiersService],
})
export class TicketTiersModule {}
