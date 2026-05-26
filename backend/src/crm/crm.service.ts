import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentService } from '../document/document.service';

@Injectable()
export class CrmService {
  constructor(
    private prisma: PrismaService,
    private documentService: DocumentService,
  ) {}

  async createLead(tenantId: string, data: any) {
    return this.prisma.lead.create({
      data: {
        tenantId,
        companyName: data.companyName,
        contact: data.contact,
        source: data.source,
        valEstimate: data.valEstimate,
        status: 'new',
      },
    });
  }

  async createPackage(tenantId: string, data: any) {
    return this.prisma.package.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        tiers: {
          create: data.tiers || [],
        },
      },
    });
  }

  async generateQuote(tenantId: string, leadId: string, packageId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    const pkg = await this.prisma.package.findUnique({ 
      where: { id: packageId },
      include: { tiers: true } 
    });

    if (!lead || !pkg) throw new Error('Lead or Package not found');

    const quoteData = {
      clientName: lead.companyName,
      packageName: pkg.name,
      basePrice: pkg.basePrice,
      tiers: pkg.tiers,
      companyName: 'HIG AI Automation LLP',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };

    return this.documentService.generateDocument(
      'Sales Quotation',
      tenantId,
      quoteData,
      'LEAD',
      leadId,
    );
  }

  async getLeads(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId },
      include: { opportunities: true },
    });
  }

  async getPackages(tenantId: string) {
    return this.prisma.package.findMany({
      where: { tenantId },
      include: { tiers: true },
    });
  }
}
