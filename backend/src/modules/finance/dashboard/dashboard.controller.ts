import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Permissions } from '../../../common/decorators';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@ApiTags('Finance Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finance/dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  @Permissions('finance.dashboard.read')
  getDashboard(@Query() query: DashboardQueryDto) {
    return this.service.getDashboard(query);
  }
}
