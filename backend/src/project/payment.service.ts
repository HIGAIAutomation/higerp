import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async getAllPayments(tenantId: string) {
    return this.prisma.projectPayment.findMany({
      where: { tenantId },
      include: {
        project: {
          select: {
            name: true,
            whatsappNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateBill(tenantId: string, data: any) {
    return this.prisma.projectPayment.create({
      data: {
        tenantId,
        projectId: data.projectId,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        status: 'pending',
        whatsappSent: false,
      },
    });
  }

  async markAsPaid(tenantId: string, id: string, username: string) {
    return this.prisma.projectPayment.update({
      where: { id, tenantId },
      data: {
        status: 'paid',
        updatedBy: username,
      },
    });
  }
}
