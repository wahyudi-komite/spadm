import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser, Permissions } from '../../../common/decorators';
import { AreaAccessGuard, JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { CreateAreaMappingDto } from './dto/create-area-mapping.dto';
import { PicDashboardQueryDto } from './dto/pic-dashboard-query.dto';
import { DistributionsService } from './distributions.service';

@Controller('bazaar/distributions')
export class DistributionsController {
  constructor(private readonly distributionsService: DistributionsService) {}

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('bazaar.distribution.read')
  @Get('areas')
  findAreas() {
    return this.distributionsService.findAreas();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('bazaar.distribution.read')
  @Get('mappings')
  findMappings() {
    return this.distributionsService.findMappings();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard, AreaAccessGuard)
  @Permissions('bazaar.distribution.scan')
  @Get('pic-dashboard')
  picDashboard(
    @CurrentUser() userId: number,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: PicDashboardQueryDto,
  ) {
    return this.distributionsService.getPicDashboard(userId, query.areaId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.manage')
  @Post('mappings')
  createMapping(
    @Body() dto: CreateAreaMappingDto,
    @CurrentUser() userId: number,
  ) {
    return this.distributionsService.createMapping(dto, userId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings.manage')
  @Delete('mappings/:id')
  removeMapping(@Param('id') id: string, @CurrentUser() userId: number) {
    return this.distributionsService.removeMapping(+id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('token/:orderId')
  getTokenByOrder(
    @Param('orderId') orderId: number,
    @CurrentUser() userId: number,
  ) {
    return this.distributionsService.getTokenByOrder(orderId, userId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('bazaar.distribution.scan')
  @Get('validate/:tokenCode')
  validateToken(
    @Param('tokenCode') tokenCode: string,
    @CurrentUser() userId: number,
  ) {
    return this.distributionsService.validateToken(tokenCode, userId);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('bazaar.distribution.confirm')
  @Post('confirm')
  confirmDistribution(
    @CurrentUser() userId: number,
    @Body() body: { tokenCode: string; notes?: string },
  ) {
    return this.distributionsService.confirmDistribution(
      body.tokenCode,
      userId,
      body.notes,
    );
  }
}
