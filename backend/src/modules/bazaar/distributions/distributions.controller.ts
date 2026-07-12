import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { DistributionsService } from './distributions.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('bazaar/distributions')
export class DistributionsController {
  constructor(private readonly distributionsService: DistributionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('token/:orderId')
  getTokenByOrder(@Param('orderId') orderId: number) {
    return this.distributionsService.getTokenByOrder(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate/:tokenCode')
  validateToken(@Param('tokenCode') tokenCode: string) {
    return this.distributionsService.validateToken(tokenCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  confirmDistribution(@Request() req: any, @Body() body: { tokenCode: string, notes?: string }) {
    return this.distributionsService.confirmDistribution(body.tokenCode, req.user.id, body.notes);
  }
}

