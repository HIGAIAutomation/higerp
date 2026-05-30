import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { HrmsService } from './hrms.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('hrms')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class HrmsController {
  constructor(private hrmsService: HrmsService) {}

  @Post('employees')
  @Roles('admin', 'hr')
  async createEmployee(@Body() body: any, @Request() req: any) {
    return this.hrmsService.createEmployee(req.user.tenantId, body);
  }

  @Get('employees')
  @Roles('admin', 'hr', 'user')
  async getEmployees(@Request() req: any) {
    return this.hrmsService.getEmployees(req.user.tenantId);
  }

  @Post('employees/:id/close')
  @Roles('admin', 'hr')
  async closeEmployee(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.hrmsService.closeEmployee(req.user.tenantId, id, body);
  }

  @Post('employees/:id/payslip')
  @Roles('admin', 'hr')
  async generatePayslip(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.hrmsService.generatePayslip(req.user.tenantId, id, body.month, body);
  }
}
