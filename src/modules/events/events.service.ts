import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { Event, Prisma } from '../../generated/prisma/client.js';
import { UpdateEventDto } from './dto/update-event.dto.js';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.EventUncheckedCreateWithoutOrganizerInput,
    organizerId: string,
  ): Promise<Event> {
    return await this.prisma.event.create({
      data: { ...data, organizerId },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.EventWhereUniqueInput;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  }): Promise<Event[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.event.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findMine(params: {
    skip?: number;
    take?: number;
    where: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return await this.prisma.event.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async findOne(where: Prisma.EventWhereUniqueInput): Promise<Event> {
    const event = await this.prisma.event.findUnique({
      where,
    });

    if (!event) throw new NotFoundException('Event does not exist');

    return event;
  }

  // async findPublished(id: string): Promise<Event> {
  //   const event = await this.prisma.event.findUnique({
  //     where: {
  //       id,
  //     },
  //   });
  //
  //   if (!event) throw new NotFoundException('Event does not exist');
  //
  //   return event;
  // }

  update(id: string, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  async remove(id: string, organizerId: string): Promise<Event | undefined> {
    try {
      return await this.prisma.event.delete({
        where: {
          id,
          organizerId,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('Cannot delete task');
      }
    }
  }
}
