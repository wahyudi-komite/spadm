import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { CurrentUser, Permissions } from '../../../common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Bazaar Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('bazaar/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Permissions('bazaar.event.create')
  create(@Body() createEventDto: CreateEventDto, @CurrentUser() userId: number) {
    return this.eventsService.create(createEventDto, userId);
  }

  @Get()
  @Permissions('bazaar.event.read')
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('active/current')
  @Permissions('bazaar.event.read')
  findActive() {
    return this.eventsService.findActive();
  }

  @Get(':id')
  @Permissions('bazaar.event.read')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('bazaar.event.update')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @CurrentUser() userId: number) {
    return this.eventsService.update(+id, updateEventDto, userId);
  }

  @Delete(':id')
  @Permissions('bazaar.event.update') // typically update/delete might share
  remove(@Param('id') id: string, @CurrentUser() userId: number) {
    return this.eventsService.remove(+id, userId);
  }
}
