import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post('add')
  addToCart(@Body() createCartDto: CreateCartDto, @Req() req: any) {
    return this.cartService.addToCart(req.user.id, createCartDto);
  }

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Delete('item/:id')
  removeItem(@Param('id') id: string, @Req() req: any) {
    return this.cartService.removeItem(req.user.id, id);
  }

  @Delete('clear')
  clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}
