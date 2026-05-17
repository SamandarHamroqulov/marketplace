import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@Req() req: any) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Post(':productId')
  addToWishlist(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.toggleWishlist(req.user.id, productId);
  }

  @Delete(':productId')
  removeFromWishlist(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.removeFromWishlist(req.user.id, productId);
  }
}
