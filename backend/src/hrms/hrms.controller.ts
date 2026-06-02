import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { HrmsService } from './hrms.service';

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

  @Get('employees/:id')
  @Roles('admin', 'hr', 'user')
  async getEmployee(@Param('id') id: string, @Request() req: any) {
    return this.hrmsService.getEmployee(req.user.tenantId, id);
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

  @Get('employees/:id/offer-letter')
  @Roles('admin', 'hr', 'user')
  async getOfferLetter(@Param('id') id: string, @Request() req: any) {
    return this.hrmsService.getOfferLetter(req.user.tenantId, id);
  }

  @Post('employees/:id/regenerate-offer-letter')
  @Roles('admin', 'hr')
  async regenerateOfferLetter(@Param('id') id: string, @Request() req: any) {
    return this.hrmsService.regenerateOfferLetter(req.user.tenantId, id);
  }
}
