import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { Event } from '../../generated/prisma/client.js';
import { CurrentUser } from '@nestjs/authentication';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { SkipThrottle } from '@nestjs/throttler';
import { RoleGuard } from '../../guards/role.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UpdateEventDto } from './dto/update-event.dto.js';

@SkipThrottle()
@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('me/events')
  @ResponseMessage('Event created')
  create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser('id', new ParseUUIDPipe()) organizerId: string,
  ): Promise<Event> {
    return this.eventsService.create(createEventDto, organizerId);
  }

  @Get('events/all')
  @UseGuards(RoleGuard)
  @Roles(['admin'])
  @ResponseMessage('All events fetched')
  findAll(): Promise<Event[]> {
    return this.eventsService.findAll({});
  }

  @Get('me/events')
  @ResponseMessage('Events fetched')
  findMine(
    @CurrentUser('id', new ParseUUIDPipe()) organizerId: string,
  ): Promise<Event[]> {
    return this.eventsService.findMine({ where: { organizerId } });
  }

  @Get('events/:eventId/cancel')
  @ResponseMessage('Event canceled')
  cancelEvent(
    @Param('eventId') eventId: string,
    @CurrentUser('id', new ParseUUIDPipe()) organizerId: string,
  ) {
    return this.eventsService.cancelEvent(eventId, organizerId);
  }

  @Get('events/:id')
  @UseGuards(RoleGuard)
  @Roles(['admin'])
  @ResponseMessage('Event found')
  findPublished(@Param('id') id: string): Promise<Event> {
    return this.eventsService.findOne({ id });
  }

  @Get('me/events/:id')
  @ResponseMessage('Event found')
  findOwned(
    @CurrentUser('id', new ParseUUIDPipe()) organizerId: string,
    @Param('id') id: string,
  ): Promise<Event> {
    return this.eventsService.findOne({ id, organizerId });
  }

  @Patch('me/events/:id')
  update(
    @CurrentUser('id', new ParseUUIDPipe()) organizerId: string,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    return this.eventsService.update(id, organizerId, updateEventDto);
  }

  @Delete('me/events/:id')
  @ResponseMessage('Event deleted')
  remove(
    @CurrentUser('id', new ParseUUIDPipe()) organizerId: string,
    @Param('id') id: string,
  ): Promise<Event | undefined> {
    return this.eventsService.remove(id, organizerId);
  }
}
