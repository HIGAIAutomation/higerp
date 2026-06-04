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
            id: true,
            name: true,
            clientId: true,
            clientName: true,
            clientEmail: true,
            clientAddress: true,
            whatsappNumber: true,
            price: true,
            modules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateBill(tenantId: string, data: any) {
    let projectId = data.projectId;
    
    if (data.isManual) {
      const count = await this.prisma.project.count({
        where: { tenantId }
      });
      const sequence = count + 1;
      const currentYear = new Date().getFullYear();
      const fyStr = `${String(currentYear).slice(-2)}-${String(currentYear + 1).slice(-2)}`;
      let customId = `higp-manual-${String(sequence).padStart(3, '0')}-${fyStr}`;
      
      const adhocProject = await this.prisma.project.create({
        data: {
          id: customId,
          tenantId,
          name: data.projectName || 'Manual Ad-hoc Project',
          clientName: data.clientName || 'Ad-hoc Client',
          category: data.category || 'Manual Billing',
          whatsappNumber: data.whatsappNumber || null,
          price: data.amount ? parseFloat(data.amount) : 0,
          status: 'active',
          description: 'Manually billed ad-hoc service/project',
        }
      });
      projectId = adhocProject.id;
    }

    return this.prisma.projectPayment.create({
      data: {
        tenantId,
        projectId,
        invoiceNumber: data.invoiceNumber,
        amount: parseFloat(data.amount),
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

  async getClientPayments(tenantId: string, clientId: string) {
    return this.prisma.projectPayment.findMany({
      where: {
        tenantId,
        project: {
          clientId: clientId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            clientId: true,
            clientName: true,
            clientEmail: true,
            clientAddress: true,
            whatsappNumber: true,
            price: true,
            modules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitClientPayment(tenantId: string, data: any, username: string) {
    const { projectId, invoiceNumber, amount, utrNumber } = data;
    const existingPayment = await this.prisma.projectPayment.findFirst({
      where: {
        tenantId,
        projectId,
        invoiceNumber,
      },
    });

    if (existingPayment) {
      return this.prisma.projectPayment.update({
        where: { id: existingPayment.id },
        data: {
          utrNumber,
          amount: parseFloat(amount),
          status: 'pending',
        },
      });
    }

    return this.prisma.projectPayment.create({
      data: {
        tenantId,
        projectId,
        invoiceNumber,
        amount: parseFloat(amount),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
        utrNumber,
        whatsappSent: false,
      },
    });
  }
}
