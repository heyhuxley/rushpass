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

@Public()
@SkipThrottle()
@Controller('events/:eventId/ticket-tiers')
export class TicketTiersController {
  constructor(private readonly ticketTiersService: TicketTiersService) {}

  @Post()
  create(
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Body() createTicketTierDto: CreateTicketTierDto,
  ) {
    return this.ticketTiersService.create({ ...createTicketTierDto, eventId });
  }

  @Get()
  findAll() {
    return this.ticketTiersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketTiersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTicketTierDto: UpdateTicketTierDto,
  ) {
    return this.ticketTiersService.update(+id, updateTicketTierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketTiersService.remove(+id);
  }
}
