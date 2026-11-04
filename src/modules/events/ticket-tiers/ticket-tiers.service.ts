import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TicketTier } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

@Injectable()
export class TicketTiersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.TicketTierUncheckedCreateInput,
  ): Promise<TicketTier> {
    try {
      return await this.prisma.ticketTier.create({ data });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new NotFoundException(
          'Failed to create ticket tier: Event not found',
        );
      }
      throw err;
    }
  }

  async findAll(eventId: string): Promise<TicketTier[]> {
    return this.prisma.ticketTier.findMany({
      where: { eventId },
    });
  }

  async findOne(where: Prisma.TicketTierWhereUniqueInput): Promise<TicketTier> {
    const event = await this.prisma.ticketTier.findUnique({
      where,
    });
    if (!event) {
      throw new NotFoundException('Ticket tier not found');
    }
    return event;
  }

  async update(
    where: Prisma.TicketTierWhereUniqueInput,
    data: Prisma.TicketTierUpdateInput,
  ): Promise<TicketTier> {
    return this.prisma.ticketTier.update({
      where,
      data,
    });
  }

  async remove(where: Prisma.TicketTierWhereUniqueInput): Promise<TicketTier> {
    try {
      return await this.prisma.ticketTier.delete({
        where,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('Ticket tier not found');
      }
      throw err;
    }
  }
}
