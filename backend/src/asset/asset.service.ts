import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  async createAsset(tenantId: string, data: any) {
    return this.prisma.asset.create({
      data: {
        tenantId,
        name: data.name,
        type: data.type,
        serialNumber: data.serialNumber,
        assignedTo: data.assignedTo,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      },
    });
  }

  async getAssets(tenantId: string) {
    return this.prisma.asset.findMany({
      where: { tenantId },
    });
  }
}
