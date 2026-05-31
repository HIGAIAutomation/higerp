import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('marketing')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MarketingController {
  constructor(private marketingService: MarketingService) {}

  @Get('posts/all')
  @Roles('admin', 'project_manager', 'user', 'superadmin')
  async getAllPostsByMonth(@Query('month') month: string, @Request() req: any) {
    return this.marketingService.getAllPostsByMonth(req.user.tenantId, month);
  }

  @Get('posts/history/all')
  @Roles('admin', 'project_manager', 'user', 'superadmin')
  async getAllPostHistory(@Query('month') month: string, @Request() req: any) {
    return this.marketingService.getPostHistory(req.user.tenantId, undefined, month);
  }

  @Get('users')
  @Roles('admin', 'project_manager', 'user', 'superadmin')
  async getTenantUsers(@Request() req: any) {
    return this.marketingService.getTenantUsers(req.user.tenantId);
  }

  @Get(':projectId/posts')
  @Roles('admin', 'project_manager', 'user', 'superadmin')
  async getPosts(
    @Param('projectId') projectId: string,
    @Query('month') month: string,
    @Request() req: any,
  ) {
    return this.marketingService.getPosts(req.user.tenantId, projectId, month);
  }

  @Post(':projectId/posts')
  @Roles('admin', 'project_manager', 'user', 'superadmin')
  async upsertPost(@Param('projectId') projectId: string, @Body() body: any, @Request() req: any) {
    return this.marketingService.upsertPost(req.user.tenantId, projectId, body, req.user.username);
  }

  @Get(':projectId/posts/history')
  @Roles('admin', 'project_manager', 'user', 'superadmin')
  async getPostHistory(
    @Param('projectId') projectId: string,
    @Query('month') month: string,
    @Request() req: any,
  ) {
    return this.marketingService.getPostHistory(req.user.tenantId, projectId, month);
  }


  @Get(':projectId/campaigns')
  @Roles('admin', 'project_manager', 'user', 'superadmin')
  async getCampaigns(@Param('projectId') projectId: string, @Request() req: any) {
    return this.marketingService.getCampaigns(req.user.tenantId, projectId);
  }

  @Post(':projectId/campaigns')
  @Roles('admin', 'project_manager', 'user', 'superadmin')
  async createCampaign(@Param('projectId') projectId: string, @Body() body: any, @Request() req: any) {
    return this.marketingService.createCampaign(req.user.tenantId, projectId, body, req.user.username);
  }

  @Get(':projectId/special-days')
  @Roles('admin', 'project_manager', 'user', 'superadmin')
  async getSpecialDayPosters(
    @Param('projectId') projectId: string,
    @Query('month') month: string,
    @Request() req: any,
  ) {
    return this.marketingService.getSpecialDayPosters(req.user.tenantId, projectId, month);
  }

  @Post(':projectId/special-days')
  @Roles('admin', 'project_manager', 'user', 'superadmin')
  async upsertSpecialDayPoster(@Param('projectId') projectId: string, @Body() body: any, @Request() req: any) {
    return this.marketingService.upsertSpecialDayPoster(req.user.tenantId, projectId, body, req.user.username);
  }

  @Get(':projectId/sheets')
  @Roles('admin', 'project_manager', 'user', 'superadmin')
  async getContentSheet(
    @Param('projectId') projectId: string,
    @Query('month') month: string,
    @Request() req: any,
  ) {
    const sheet = await this.marketingService.getContentSheet(req.user.tenantId, projectId, month);
    return sheet || { items: [], statuses: {}, campaigns: {} };
  }

  @Post(':projectId/sheets')
  @Roles('admin', 'project_manager', 'user', 'superadmin')
  async upsertContentSheet(
    @Param('projectId') projectId: string,
    @Query('month') month: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.marketingService.upsertContentSheet(req.user.tenantId, projectId, month, body);
  }
}

