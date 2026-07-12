import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Bazaar Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('bazaar/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Permissions('bazaar.event.create')
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @Permissions('bazaar.event.read')
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @Permissions('bazaar.event.read')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('bazaar.event.update')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  @Permissions('bazaar.event.update') // typically update/delete might share
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}
