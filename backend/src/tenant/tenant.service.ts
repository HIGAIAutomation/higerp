import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async getTenantBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with slug ${slug} not found`);
    }
    return tenant;
  }

  async getTenantById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }
}
