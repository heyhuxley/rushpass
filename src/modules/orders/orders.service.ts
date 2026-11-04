import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}
  
  async createOrder(userId: string, ticketTierId: string, quantity: number, unitPrice: number) {}
}
