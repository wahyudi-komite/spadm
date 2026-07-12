import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { DistributionsService } from './distributions.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('bazaar/distributions')
export class DistributionsController {
  constructor(private readonly distributionsService: DistributionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('token/:orderId')
  getTokenByOrder(@Param('orderId') orderId: number) {
    return this.distributionsService.getTokenByOrder(orderId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PIC_AREA', 'SUPER_ADMIN')
  @Get('validate/:tokenCode')
  validateToken(@Param('tokenCode') tokenCode: string) {
    return this.distributionsService.validateToken(tokenCode);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PIC_AREA', 'SUPER_ADMIN')
  @Post('confirm')
  confirmDistribution(@Request() req: any, @Body() body: { tokenCode: string, notes?: string }) {
    return this.distributionsService.confirmDistribution(body.tokenCode, req.user.id, body.notes);
  }
}
