import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { CurrentUser, Permissions } from '../../../common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BatchStatus } from './entities/batch.entity';

@ApiTags('Bazaar Batches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('bazaar/batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Post()
  @Permissions('bazaar.batch.create')
  create(@Body() createBatchDto: CreateBatchDto, @CurrentUser() userId: number) {
    return this.batchesService.create(createBatchDto, userId);
  }

  @Get()
  @Permissions('bazaar.batch.read')
  findAll(@Query('eventId') eventId?: number) {
    return this.batchesService.findAll(eventId ? Number(eventId) : undefined);
  }

  @Get('current/:eventId')
  @Permissions('bazaar.batch.read')
  findCurrent(@Param('eventId') eventId: string) {
    return this.batchesService.findCurrent(+eventId);
  }

  @Get(':id')
  @Permissions('bazaar.batch.read')
  findOne(@Param('id') id: string) {
    return this.batchesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('bazaar.batch.update')
  update(@Param('id') id: string, @Body() updateBatchDto: UpdateBatchDto, @CurrentUser() userId: number) {
    return this.batchesService.update(+id, updateBatchDto, userId);
  }

  @Post(':id/open')
  @Permissions('bazaar.batch.open')
  open(@Param('id') id: string, @CurrentUser() userId: number) {
    return this.batchesService.transition(+id, BatchStatus.OPEN, userId);
  }

  @Post(':id/close')
  @Permissions('bazaar.batch.close')
  close(@Param('id') id: string, @CurrentUser() userId: number) {
    return this.batchesService.transition(+id, BatchStatus.CLOSED, userId);
  }

  @Post(':id/start-distribution')
  @Permissions('bazaar.batch.distribute')
  startDistribution(@Param('id') id: string, @CurrentUser() userId: number) {
    return this.batchesService.transition(+id, BatchStatus.DISTRIBUTION, userId);
  }

  @Post(':id/complete')
  @Permissions('bazaar.batch.distribute')
  complete(@Param('id') id: string, @CurrentUser() userId: number) {
    return this.batchesService.transition(+id, BatchStatus.COMPLETED, userId);
  }

  @Post(':id/cancel')
  @Permissions('bazaar.batch.update')
  cancel(@Param('id') id: string, @CurrentUser() userId: number) {
    return this.batchesService.transition(+id, BatchStatus.CANCELLED, userId);
  }

  @Delete(':id')
  @Permissions('bazaar.batch.update')
  remove(@Param('id') id: string, @CurrentUser() userId: number) {
    return this.batchesService.remove(+id, userId);
  }
}
