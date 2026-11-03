import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { Event, Prisma } from '../../generated/prisma/client.js';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService, private readonly logger: Logger) {}

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

  async update(id: string, organizerId: string, data: Prisma.EventUpdateInput) {
    try {
      return await this.prisma.event.update({
        where: { id, organizerId },
        data,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('Event does not exist');
      }
      throw err;
    }
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

  @Cron(CronExpression.EVERY_MINUTE)
  async publishDue() {
    const result = await this.prisma.event.updateMany({
      data: {
        status: 'PUBLISHED',
      },
      where: {
        status: 'DRAFT',
        startTime: {
          gte: new Date(),
        },
        OR: [
          {
            publishAt: {
              lte: new Date(),
            },
          },
          {
            publishAt: null,
          },
        ],
        ticketTiers: {
          some: {},
        },
      },
    });
    
    this.logger.log(`Published ${result.count} event(s)`);
  }
}
