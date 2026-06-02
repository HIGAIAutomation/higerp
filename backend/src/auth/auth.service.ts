import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { HrmsService } from '../hrms/hrms.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private hrmsService: HrmsService,
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
      if (user.role === 'pending') {
        throw new UnauthorizedException('Your account is pending approval from the Super Admin.');
      }
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
        whatsappNumber: user.whatsappNumber,
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
    const role = isFirstUser ? 'superadmin' : 'pending';

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userEmail = data.email || `${data.username}@hig.ai`;
    
    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: userEmail,
        password: hashedPassword,
        dob: data.dob || null,
        address: data.address || null,
        tenantId,
        role,
        pageAccess: isFirstUser ? ['*'] : [],
      },
    });

    if (data.roleType === 'employee' || data.roleType === 'intern') {
      await this.prisma.employee.create({
        data: {
          tenantId,
          firstName: data.firstName || data.studentName || data.username,
          lastName: data.lastName || '',
          email: userEmail,
          designation: data.designation || data.domain || null,
          salaryBasis: data.expectedSalary || data.price ? parseFloat(data.expectedSalary || data.price) : null,
          joiningDate: data.startDate ? new Date(data.startDate) : new Date(),
          profDocNumber: data.aadhar || data.pan || data.registerNumber || null,
          status: 'pending',
          metadata: data,
        }
      });
    }

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

    if (data.role && data.role !== 'pending') {
      const empEmail = user.email || `${user.username}@hig.ai`;
      const emp = await this.prisma.employee.findFirst({
        where: { tenantId, email: empEmail }
      });
      if (emp && emp.status === 'pending') {
        const updatedEmp = await this.prisma.employee.update({
          where: { id: emp.id },
          data: { status: 'active', designation: updateData.designation || emp.designation, salaryBasis: updateData.salary || emp.salaryBasis }
        });

        // Generate onboarding documents on approval
        try {
          await this.hrmsService.generateOnboardingDocuments(tenantId, updatedEmp);
        } catch (error) {
          console.error(`Failed to generate onboarding documents on approval: ${error.message}`);
        }
      }
    }

    const { password, ...result } = user;
    return result;
  }

  async getUserById(userId: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, tenantId },
    });
  }

  async updateProfile(userId: string, tenantId: string, data: any) {
    const updateData: any = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.dob !== undefined) updateData.dob = data.dob;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.whatsappNumber !== undefined) updateData.whatsappNumber = data.whatsappNumber;
    if (data.phone !== undefined) updateData.whatsappNumber = data.phone;
    
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id: userId, tenantId },
      data: updateData,
    });

    const { password, ...result } = user;
    return result;
  }
}
