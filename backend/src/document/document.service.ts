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

    if (!Handlebars.helpers['or']) {
      Handlebars.registerHelper('or', function (a, b) {
        return a || b;
      });
    }
    const compiledTemplate = Handlebars.compile(template.contentHtml);
    const contentHtml = compiledTemplate(data);

    const existingDoc = await this.prisma.generatedDocument.findFirst({
      where: {
        tenantId,
        templateId: template.id,
        entityType,
        entityId,
      },
    });

    if (existingDoc) {
      return this.prisma.generatedDocument.update({
        where: { id: existingDoc.id },
        data: {
          compiledHtml: contentHtml,
          status: 'generated',
        },
      });
    }

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

  async generatePdf(tenantId: string, id: string): Promise<Buffer> {
    const doc = await this.getDocument(tenantId, id);
    if (!doc || !doc.compiledHtml) {
      throw new Error('Document not found or compiled HTML is empty.');
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Inter', sans-serif;
              background: #ffffff;
              color: #0f172a;
            }
            .legal-document-wrapper {
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
            }
            .legal-document-wrapper * {
              color: #0f172a !important;
              background-color: transparent !important;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="legal-document-wrapper">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2E9EDE; padding-bottom: 12px; margin-bottom: 25px;">
              <div style="text-align: left;">
                <span style="font-family: sans-serif; font-size: 16px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px;">HIG ENTERPRISE</span>
              </div>
              <div style="text-align: right;">
                <span style="font-family: sans-serif; font-size: 10px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px;">HIG ENTERPRISE PORTAL</span>
                <br/>
                <span style="font-family: sans-serif; font-size: 8px; font-weight: 600; color: #64748b; tracking: 0.5px;">OFFICIAL SECURE DOCUMENT</span>
              </div>
            </div>
            ${doc.compiledHtml}
          </div>
        </body>
      </html>
    `;

    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'Letter',
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '20mm',
          right: '20mm',
        },
        printBackground: true,
      });
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
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
