import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string, tenantId: string = '00000000-0000-0000-0000-000000000000'): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: { 
        tenantId,
        OR: [
          { username },
          { email: username }
        ]
      },
    });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, tenantId: user.tenantId, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        tenantId: user.tenantId,
        dob: user.dob,
        address: user.address,
        designation: user.designation,
        salary: user.salary,
        pageAccess: user.pageAccess,
      },
    };
  }

  async register(data: any) {
    const tenantId = data.tenantId || '00000000-0000-0000-0000-000000000000';
    
    // Check if username is already taken
    const existingUser = await this.prisma.user.findFirst({
      where: { username: data.username, tenantId },
    });
    if (existingUser) {
      throw new BadRequestException('Username is already taken');
    }

    const count = await this.prisma.user.count({
      where: { tenantId },
    });

    const isFirstUser = count === 0;
    const role = isFirstUser ? 'superadmin' : 'user';

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        dob: data.dob || null,
        address: data.address || null,
        tenantId,
        role,
        pageAccess: isFirstUser ? ['*'] : [],
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async getAllUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        dob: true,
        address: true,
        designation: true,
        salary: true,
        pageAccess: true,
        createdAt: true,
      },
    });
  }

  async updateUserAccess(userId: string, tenantId: string, data: any) {
    const updateData: any = {};
    if (data.designation !== undefined) updateData.designation = data.designation;
    if (data.salary !== undefined) {
      updateData.salary = data.salary === null || data.salary === '' ? null : Number(data.salary);
    }
    if (data.pageAccess !== undefined) updateData.pageAccess = data.pageAccess;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.dob !== undefined) updateData.dob = data.dob;
    if (data.address !== undefined) updateData.address = data.address;

    const user = await this.prisma.user.update({
      where: { id: userId, tenantId },
      data: updateData,
    });

    const { password, ...result } = user;
    return result;
  }

  async getUserById(userId: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });
  }
}
