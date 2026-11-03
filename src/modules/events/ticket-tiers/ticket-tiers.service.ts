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
        throw new NotFoundException('Failed to create ticket tier: Event not found');
      }
      throw err;
    }
  }

  findAll() {
    return `This action returns all ticketTiers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ticketTier`;
  }

  update(id: number, updateTicketTierDto: UpdateTicketTierDto) {
    return `This action updates a #${id} ticketTier`;
  }

  remove(id: number) {
    return `This action removes a #${id} ticketTier`;
  }
}
