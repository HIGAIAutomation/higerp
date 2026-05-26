import { Controller, Post, Body, Get, UseGuards, Request, Param } from '@nestjs/common';
import { CrmService } from './crm.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('crm')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CrmController {
  constructor(private crmService: CrmService) {}

  @Post('leads')
  @Roles('admin', 'sales')
  async createLead(@Body() body: any, @Request() req: any) {
    return this.crmService.createLead(req.user.tenantId, body);
  }

  @Get('leads')
  @Roles('admin', 'sales')
  async getLeads(@Request() req: any) {
    return this.crmService.getLeads(req.user.tenantId);
  }

  @Post('packages')
  @Roles('admin')
  async createPackage(@Body() body: any, @Request() req: any) {
    return this.crmService.createPackage(req.user.tenantId, body);
  }

  @Get('packages')
  @Roles('admin', 'sales', 'user')
  async getPackages(@Request() req: any) {
    return this.crmService.getPackages(req.user.tenantId);
  }

  @Post('leads/:id/quote')
  @Roles('admin', 'sales')
  async generateQuote(@Param('id') leadId: string, @Body('packageId') packageId: string, @Request() req: any) {
    return this.crmService.generateQuote(req.user.tenantId, leadId, packageId);
  }
}
