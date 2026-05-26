import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { SupportService } from './support.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('support')
@UseGuards(AuthGuard('jwt'))
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('tickets')
  async createTicket(@Body() body: any, @Request() req: any) {
    return this.supportService.createTicket(req.user.tenantId, req.user.userId, body);
  }

  @Get('tickets')
  async getTickets(@Request() req: any) {
    return this.supportService.getTickets(req.user.tenantId);
  }
}
