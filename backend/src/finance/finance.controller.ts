import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('finance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  @Post('invoices')
  @Roles('admin', 'accounts')
  async createInvoice(@Body() body: any, @Request() req: any) {
    return this.financeService.createInvoice(req.user.tenantId, body);
  }

  @Post('expenses')
  @Roles('admin', 'accounts', 'hr')
  async createExpense(@Body() body: any, @Request() req: any) {
    return this.financeService.createExpense(req.user.tenantId, body);
  }

  @Get('summary')
  @Roles('admin', 'accounts')
  async getSummary(@Request() req: any) {
    return this.financeService.getFinancialSummary(req.user.tenantId);
  }
}
