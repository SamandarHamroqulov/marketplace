import { Controller, Get, Post, Param, UseGuards, Req, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post('checkout')
  checkout(@Req() req: any, @Body() checkoutDto: CheckoutDto) {
    return this.ordersService.createOrderFromCart(req.user.id, checkoutDto);
  }

  @Get('my-orders')
  findAll(@Req() req: any) {
    return this.ordersService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.ordersService.findOne(id, req.user.id);
  }
}
