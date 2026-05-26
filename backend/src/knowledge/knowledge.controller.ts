import { Controller, Post, Body, Get, Query, UseGuards, Request } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('knowledge')
@UseGuards(AuthGuard('jwt'))
export class KnowledgeController {
  constructor(private knowledgeService: KnowledgeService) {}

  @Post('entries')
  async createEntry(@Body() body: any, @Request() req: any) {
    return this.knowledgeService.createEntry(req.user.tenantId, req.user.userId, body);
  }

  @Get('search')
  async search(@Query('q') query: string, @Request() req: any) {
    return this.knowledgeService.searchEntries(req.user.tenantId, query);
  }
}
