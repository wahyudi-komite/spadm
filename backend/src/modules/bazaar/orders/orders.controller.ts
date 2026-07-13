import { Controller, Post, Body, Get, Param, Patch, UseGuards, ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CalculateCartDto, CheckoutDto, CancelOrderDto } from './dto';

@Controller('bazaar/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('calculate')
  calculate(@Body(ValidationPipe) body: CalculateCartDto) {
    return this.ordersService.calculateCart(body.productIds);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  checkout(@CurrentUser() userId: number, @Body(ValidationPipe) body: CheckoutDto) {
    return this.ordersService.checkout(userId, body.eventId, body.productIds, body.termsAccepted);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyOrders(@CurrentUser() userId: number) {
    return this.ordersService.getMyOrders(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOrder(@CurrentUser() userId: number, @Param('id') id: number) {
    return this.ordersService.getOrderById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancelOrder(
    @CurrentUser() userId: number,
    @Param('id') id: number,
    @Body(ValidationPipe) body: CancelOrderDto
  ) {
    return this.ordersService.cancelOrder(id, userId, body.reason);
  }
}

