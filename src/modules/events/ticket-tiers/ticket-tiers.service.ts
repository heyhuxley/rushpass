import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateTicketTierDto } from './dto/update-ticket-tier.dto.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

@Injectable()
export class TicketTiersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TicketTierUncheckedCreateInput) {
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

  findAll(eventId: string) {
    return this.prisma.ticketTier.findMany({
      where: { eventId },
    });
  }

  async findOne(where: Prisma.TicketTierWhereUniqueInput) {
    const event = await this.prisma.ticketTier.findUnique({
      where,
    });
    if (!event) {
      throw new NotFoundException('Ticket tier not found');
    }
    return event;
  }

  update(id: number, updateTicketTierDto: UpdateTicketTierDto) {
    return `This action updates a #${id} ticketTier`;
  }

  async remove(where: Prisma.TicketTierWhereUniqueInput) {
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
