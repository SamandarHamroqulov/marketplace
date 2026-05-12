import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/utils/multer-config';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @UseGuards(JwtAuthGuard)
  @Post("create")
  @UseInterceptors(FilesInterceptor('images', 5, multerOptions))
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.productService.create(createProductDto, req.user.id, files);
  }

  @Get("all")
  @UseInterceptors(CacheInterceptor)
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 5, multerOptions))
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.productService.update(id, updateProductDto, req.user, files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.productService.remove(id, req.user);
  }
}
