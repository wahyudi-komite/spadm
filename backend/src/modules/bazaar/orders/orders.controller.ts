import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('bazaar/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('calculate')
  calculate(@Body() body: { productIds: number[] }) {
    return this.ordersService.calculateCart(body.productIds);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@Request() req: any, @Body() body: { eventId: number, productIds: number[] }) {
    return this.ordersService.checkout(req.user.id, body.eventId, body.productIds);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyOrders(@Request() req: any) {
    return this.ordersService.getMyOrders(req.user.id);
  }
}

