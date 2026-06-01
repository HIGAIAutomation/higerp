import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('project-payments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get()
  @Roles('superadmin')
  async getAllPayments(@Request() req: any) {
    return this.paymentService.getAllPayments(req.user.tenantId);
  }

  @Post()
  @Roles('superadmin')
  async generateBill(@Body() body: any, @Request() req: any) {
    return this.paymentService.generateBill(req.user.tenantId, body);
  }

  @Get('client')
  @Roles('client', 'user')
  async getClientPayments(@Request() req: any) {
    return this.paymentService.getClientPayments(req.user.tenantId, req.user.userId);
  }

  @Put(':id/pay')
  @Roles('superadmin')
  async markAsPaid(@Param('id') id: string, @Request() req: any) {
    return this.paymentService.markAsPaid(req.user.tenantId, id, req.user.username);
  }
}
