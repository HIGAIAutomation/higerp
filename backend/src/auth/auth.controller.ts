import { Controller, Post, Body, UnauthorizedException, ForbiddenException, Get, UseGuards, Request, Param, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const tenantId = body.tenantId || '00000000-0000-0000-0000-000000000000';
    const user = await this.authService.validateUser(body.username, body.password, tenantId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: any) {
    const user = await this.authService.getUserById(req.user.userId, req.user.tenantId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('users')
  async getAllUsers(@Request() req: any) {
    if (req.user.role !== 'superadmin') {
      throw new ForbiddenException('Only superadmin can perform this action');
    }
    return this.authService.getAllUsers(req.user.tenantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('users/:id')
  async updateUserAccess(
    @Request() req: any,
    @Param('id') userId: string,
    @Body() body: any,
  ) {
    if (req.user.role !== 'superadmin') {
      throw new ForbiddenException('Only superadmin can perform this action');
    }
    return this.authService.updateUserAccess(userId, req.user.tenantId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('profile')
  async updateProfile(
    @Request() req: any,
    @Body() body: any,
  ) {
    const userId = req.user.userId;
    const tenantId = req.user.tenantId;
    return this.authService.updateProfile(userId, tenantId, body);
  }
}
