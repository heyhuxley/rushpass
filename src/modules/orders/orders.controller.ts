import { Body, Controller, ParseUUIDPipe, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Authenticate, CurrentUser } from '@nestjs/authentication';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Authenticate({verifiedEmail: true})
  order(
    @CurrentUser('id', new ParseUUIDPipe()) userId: string,
    @Body() orderItems: CreateOrderDto,
  ) {
    return this.ordersService.create(userId, { items: orderItems.items });
  }
}
