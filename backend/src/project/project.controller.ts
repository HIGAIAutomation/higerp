import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('projects')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post()
  @Roles('admin', 'project_manager')
  async createProject(@Body() body: any, @Request() req: any) {
    return this.projectService.createProject(req.user.tenantId, body);
  }

  @Get()
  @Roles('admin', 'project_manager', 'user')
  async getProjects(@Request() req: any) {
    return this.projectService.getProjects(req.user.tenantId);
  }

  @Put(':id')
  @Roles('superadmin')
  async updateProject(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.projectService.updateProject(id, req.user.tenantId, body);
  }

  @Delete(':id')
  @Roles('superadmin')
  async deleteProject(@Param('id') id: string, @Request() req: any) {
    return this.projectService.deleteProject(id, req.user.tenantId);
  }
}
