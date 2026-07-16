import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
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

  @Post('upload-image')
  @Permissions('bazaar.product.create', 'bazaar.product.update')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const directory = join(process.cwd(), 'storage', 'products');
          mkdirSync(directory, { recursive: true });
          cb(null, directory);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Hanya file gambar yang diizinkan'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File tidak ditemukan');
    return { url: `/storage/products/${file.filename}` };
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
