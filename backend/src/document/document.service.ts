import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Handlebars from 'handlebars';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async generateDocument(templateName: string, tenantId: string, data: any, entityType: string, entityId: string) {
    const template = await this.prisma.documentTemplate.findFirst({
      where: { name: templateName, tenantId },
      orderBy: { createdAt: 'desc' },
    });

    if (!template) {
      throw new Error(`Template ${templateName} not found for tenant ${tenantId}`);
    }

    const compiledTemplate = Handlebars.compile(template.contentHtml);
    const contentHtml = compiledTemplate(data);

    return this.prisma.generatedDocument.create({
      data: {
        tenantId,
        templateId: template.id,
        entityType,
        entityId,
        status: 'generated',
        filePath: 'path/to/generated/doc.html', 
        compiledHtml: contentHtml,
      },
    });
  }

  async getDocument(tenantId: string, id: string) {
    return this.prisma.generatedDocument.findFirst({
      where: { id, tenantId },
      include: { template: true },
    });
  }

  async getDocumentsForEntity(tenantId: string, entityId: string, entityType: string) {
    return this.prisma.generatedDocument.findMany({
      where: { tenantId, entityId, entityType },
      include: { template: true },
    });
  }

  async createTemplate(tenantId: string, name: string, category: string, contentHtml: string) {
    return this.prisma.documentTemplate.create({
      data: { tenantId, name, category, contentHtml },
    });
  }
}
