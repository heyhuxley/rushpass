import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Authenticate, CurrentUser, Public } from '@nestjs/authentication';
import { Stripe } from 'stripe';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Authenticate({ verifiedEmail: true })
  order(
    @CurrentUser('id', new ParseUUIDPipe()) userId: string,
    @Body() orderItems: CreateOrderDto,
  ) {
    return this.ordersService.create(userId, { items: orderItems.items });
  }

  @Public()
  @Get(':id/status')
  getOrderStatus(
    @Param('id', new ParseUUIDPipe()) orderId: string,
    @Query('session_id') sessionId: string,
  ): Promise<Stripe.Checkout.Session | undefined> {
    return this.ordersService.getOrderStatus(orderId, sessionId)
  }
}
