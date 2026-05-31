import { Controller, Post, Body, Get, Put, Delete, UseGuards, Request, Param } from '@nestjs/common';
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

  @Put('leads/:id')
  @Roles('admin', 'sales')
  async updateLead(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.crmService.updateLead(req.user.tenantId, id, body);
  }

  @Delete('leads/:id')
  @Roles('admin', 'sales')
  async deleteLead(@Param('id') id: string, @Request() req: any) {
    return this.crmService.deleteLead(req.user.tenantId, id);
  }

  @Post('followups')
  @Roles('admin', 'sales')
  async createFollowUp(@Body() body: any, @Request() req: any) {
    return this.crmService.createFollowUp(req.user.tenantId, body);
  }

  @Get('followups')
  @Roles('admin', 'sales')
  async getFollowUps(@Request() req: any) {
    return this.crmService.getFollowUps(req.user.tenantId);
  }

  @Delete('followups/:id')
  @Roles('admin', 'sales')
  async deleteFollowUp(@Param('id') id: string, @Request() req: any) {
    return this.crmService.deleteFollowUp(req.user.tenantId, id);
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

  @Put('packages/:id')
  @Roles('admin')
  async updatePackage(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.crmService.updatePackage(req.user.tenantId, id, body);
  }

  @Delete('packages/:id')
  @Roles('admin')
  async deletePackage(@Param('id') id: string, @Request() req: any) {
    return this.crmService.deletePackage(req.user.tenantId, id);
  }

  @Post('leads/:id/quote')
  @Roles('admin', 'sales')
  async generateQuote(@Param('id') leadId: string, @Body('packageId') packageId: string, @Request() req: any) {
    return this.crmService.generateQuote(req.user.tenantId, leadId, packageId);
  }
}
