import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('assets')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AssetController {
  constructor(private assetService: AssetService) {}

  @Post()
  @Roles('admin', 'it_support')
  async createAsset(@Body() body: any, @Request() req: any) {
    return this.assetService.createAsset(req.user.tenantId, body);
  }

  @Get()
  async getAssets(@Request() req: any) {
    return this.assetService.getAssets(req.user.tenantId);
  }
}
