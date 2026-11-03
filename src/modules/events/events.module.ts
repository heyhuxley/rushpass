import { Module } from '@nestjs/common';
import { EventsService } from './events.service.js';
import { EventsController } from './events.controller.js';
import { PrismaModule } from '../../infra/prisma/prisma.module.js';
import { TicketTiersModule } from './ticket-tiers/ticket-tiers.module.js';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [PrismaModule, TicketTiersModule],
})
export class EventsModule {}
