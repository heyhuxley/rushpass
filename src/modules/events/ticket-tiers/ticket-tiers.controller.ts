import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TicketTiersService } from './ticket-tiers.service.js';
import { CreateTicketTierDto } from './dto/create-ticket-tier.dto.js';
import { UpdateTicketTierDto } from './dto/update-ticket-tier.dto.js';
import { Public } from '@nestjs/authentication';
import { SkipThrottle } from '@nestjs/throttler';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator.js';

@Public()
@SkipThrottle()
@Controller('events/:eventId/ticket-tiers')
export class TicketTiersController {
  constructor(private readonly ticketTiersService: TicketTiersService) {}

  @Post()
  @ResponseMessage('Ticket tier created successfully')
  create(
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Body() createTicketTierDto: CreateTicketTierDto,
  ) {
    return this.ticketTiersService.create({ ...createTicketTierDto, eventId, available: createTicketTierDto.capacity });
  }

  @Get()
  @ResponseMessage('Ticket tiers retrieved successfully')
  findAll(@Param('eventId', new ParseUUIDPipe()) eventId: string) {
    return this.ticketTiersService.findAll(eventId);
  }

  @Get(':id')
  @ResponseMessage('Ticket tier retrieved successfully')
  findOne(
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Param('id') id: string,
  ) {
    return this.ticketTiersService.findOne({ id, eventId });
  }

  @Patch(':id')
  @ResponseMessage('Ticket tier updated successfully')
  update(
    @Param('id') id: string,
    @Body() updateTicketTierDto: UpdateTicketTierDto,
  ) {
    return this.ticketTiersService.update({ id }, updateTicketTierDto);
  }

  @Delete(':id')
  remove(
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Param('id') id: string,
  ) {
    return this.ticketTiersService.remove({ id, eventId });
  }
}
