import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { CurrentUser, Permissions } from '../../../common/decorators';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('bazaar/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Permissions('bazaar.product.create')
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() userId: number) {
    return this.productsService.create(createProductDto, userId);
  }

  @Get()
  @Permissions('bazaar.product.read')
  findAll(@Query('eventId') eventId?: number) {
    return this.productsService.findAll(eventId ? Number(eventId) : undefined);
  }

  @Get(':id')
  @Permissions('bazaar.product.read')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('bazaar.product.update')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @CurrentUser() userId: number) {
    return this.productsService.update(+id, updateProductDto, userId);
  }

  @Delete(':id')
  @Permissions('bazaar.product.delete')
  remove(@Param('id') id: string, @CurrentUser() userId: number) {
    return this.productsService.remove(+id, userId);
  }
}
