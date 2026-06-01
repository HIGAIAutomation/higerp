import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Handlebars from 'handlebars';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) { }

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
    const doc = await this.prisma.generatedDocument.findFirst({
      where: { id, tenantId },
      include: { template: true },
    });

    if (doc && doc.compiledHtml) {
      // 1. Always replace the generic left column signature label with CEO details
      const robustLabelPattern = /<p>For: <strong>(HIG AI AUTOMATION LLP|HIGAI AUTOMATION LLP|HIG AI AUTOMATION|HIGAI AUTOMATION)<\/strong><\/p>\s*(<div class="sig-line"(?: style="[^"]*")?>[\s\S]*?<\/div>)\s*<p class="sig-label">(?:Authorized Signature|Authorized Signatory|Authorized Representative|Authorized Lead)<\/p>/g;
      doc.compiledHtml = doc.compiledHtml.replace(robustLabelPattern, (match, companyName, sigLine) => {
        return `<p>For: <strong>${companyName}</strong></p>
      ${sigLine}
      <p class="sig-label" style="text-transform: none; font-weight: bold; font-size: 13px; color: #0f172a; margin-top: 5px;">Mr. Ajay S</p>
      <p class="sig-label" style="text-transform: none; font-size: 11px; color: #475569; margin-top: 2px;">CEO of HIGAI Automation LLP</p>`;
      });

      const fs = require('fs');
      const path = require('path');
      const signatureFilePath = path.resolve(process.cwd(), 'ceo-signature.txt');
      if (fs.existsSync(signatureFilePath)) {
        const ceoSignatureData = fs.readFileSync(signatureFilePath, 'utf8');
        if (ceoSignatureData && ceoSignatureData.startsWith('data:image')) {
          const defaultCeoBlock = `<!-- Admin/CEO Signature (Default) -->
      <div style="font-family: 'Playfair Display', cursive; font-size: 24px; color: #1e293b; margin: 15px 0 5px 0; font-style: italic;">Ajay S</div>`;
          const activeCeoBlock = `<div style="display: flex; align-items: center; gap: 8px; margin-top: 5px; margin-bottom: 5px;"><img src="${ceoSignatureData}" alt="CEO Signature" style="height: 55px; width: auto; max-width: 180px; object-fit: contain;" /><div style="display: flex; flex-direction: column; justify-content: center; font-size: 8px; color: #10b981; border-left: 1px solid #e2e8f0; padding-left: 8px; font-family: 'Inter', sans-serif; line-height: 1.2; text-align: left;"><span style="font-weight: bold; display: flex; align-items: center; gap: 3px; color: #10b981;"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>Digitally Signed</span><span style="color: #64748b;">Verified CEO</span><span style="color: #64748b;">HIGAI Automation</span></div></div>`;

          if (doc.compiledHtml.includes(defaultCeoBlock)) {
            doc.compiledHtml = doc.compiledHtml.replace(defaultCeoBlock, `<!-- Admin/CEO Signature (Default) -->${activeCeoBlock}`);
          } else {
            // Support older/fallback document signature blocks in existing DB records
            const targetLinePattern = /<p>For: <strong>(HIG AI AUTOMATION LLP|HIGAI AUTOMATION LLP|HIG AI AUTOMATION|HIGAI AUTOMATION)<\/strong><\/p>\s*<div class="sig-line"><\/div>/g;
            doc.compiledHtml = doc.compiledHtml.replace(targetLinePattern, (match, companyName) => {
              return `<p>For: <strong>${companyName}</strong></p><div class="sig-line" style="border-bottom: none; margin-top: 10px; margin-bottom: 0px; height: auto;">${activeCeoBlock}</div><div class="sig-line" style="margin-top: 5px;"></div>`;
            });
          }
          doc.compiledHtml = doc.compiledHtml.replace('Mr. Ajay S', 'Mr. Ajay S');
        }
      }
    }

    return doc;
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
            .doc-header-logo {
              height: 48px;
              width: auto;
              border-radius: 10px;
              object-fit: contain;
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
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2E9EDE; padding-bottom: 14px; margin-bottom: 28px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="http://localhost:3001/logo.png" class="doc-header-logo" alt="HIG AI Automation LLP" />
                <div>
                  <div style="font-family: sans-serif; font-size: 15px; font-weight: 800; color: #0f172a; letter-spacing: 0.3px; line-height: 1.2;">HIG AI AUTOMATION LLP</div>
                  <div style="font-family: sans-serif; font-size: 9px; font-weight: 600; color: #64748b; margin-top: 2px;">PPCQ+XH5, S Bazaar, Palayamkottai, Tirunelveli, Tamil Nadu 627002</div>
                  <div style="font-family: sans-serif; font-size: 9px; font-weight: 700; color: #2E9EDE; margin-top: 1px;">LLPIN: AAY-0857 &nbsp;|&nbsp; GSTIN: 33ACFHH7098M1ZK</div>
                </div>
              </div>
              <div style="text-align: right;">
                <span style="font-family: sans-serif; font-size: 10px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px;">OFFICIAL DOCUMENT</span>
                <br/>
                <span style="font-family: sans-serif; font-size: 8px; font-weight: 600; color: #64748b; tracking: 0.5px;">CONFIDENTIAL &amp; SECURE</span>
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
    const docs = await this.prisma.generatedDocument.findMany({
      where: { tenantId, entityId, entityType },
      include: { template: true },
    });

    const fs = require('fs');
    const path = require('path');

    // 1. Always replace the generic left column signature label with CEO details
    const robustLabelPattern = /<p>For: <strong>(HIG AI AUTOMATION LLP|HIGAI AUTOMATION LLP|HIG AI AUTOMATION|HIGAI AUTOMATION)<\/strong><\/p>\s*(<div class="sig-line"(?: style="[^"]*")?>[\s\S]*?<\/div>)\s*<p class="sig-label">(?:Authorized Signature|Authorized Signatory|Authorized Representative|Authorized Lead)<\/p>/g;
    for (const doc of docs) {
      if (doc.compiledHtml) {
        doc.compiledHtml = doc.compiledHtml.replace(robustLabelPattern, (match, companyName, sigLine) => {
          return `<p>For: <strong>${companyName}</strong></p>
        ${sigLine}
        <p class="sig-label" style="text-transform: none; font-weight: bold; font-size: 13px; color: #0f172a; margin-top: 5px;">Mr. Ajay S</p>
        <p class="sig-label" style="text-transform: none; font-size: 11px; color: #475569; margin-top: 2px;">CEO of HIGAI Automation LLP</p>`;
        });
      }
    }

    const signatureFilePath = path.resolve(process.cwd(), 'ceo-signature.txt');
    if (fs.existsSync(signatureFilePath)) {
      const ceoSignatureData = fs.readFileSync(signatureFilePath, 'utf8');
      if (ceoSignatureData && ceoSignatureData.startsWith('data:image')) {
        const defaultCeoBlock = `<!-- Admin/CEO Signature (Default) -->
      <div style="font-family: 'Playfair Display', cursive; font-size: 24px; color: #1e293b; margin: 15px 0 5px 0; font-style: italic;">Ajay S</div>`;
        const activeCeoBlock = `<div style="display: flex; align-items: center; gap: 8px; margin-top: 5px; margin-bottom: 5px;"><img src="${ceoSignatureData}" alt="CEO Signature" style="height: 55px; width: auto; max-width: 180px; object-fit: contain;" /><div style="display: flex; flex-direction: column; justify-content: center; font-size: 8px; color: #10b981; border-left: 1px solid #e2e8f0; padding-left: 8px; font-family: 'Inter', sans-serif; line-height: 1.2; text-align: left;"><span style="font-weight: bold; display: flex; align-items: center; gap: 3px; color: #10b981;"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>Digitally Signed</span><span style="color: #64748b;">Verified CEO</span><span style="color: #64748b;">HIGAI Automation</span></div></div>`;

        for (const doc of docs) {
          if (doc.compiledHtml) {
            if (doc.compiledHtml.includes(defaultCeoBlock)) {
              doc.compiledHtml = doc.compiledHtml.replace(defaultCeoBlock, `<!-- Admin/CEO Signature (Default) -->${activeCeoBlock}`);
            } else {
              // Support older/fallback document signature blocks in existing DB records
              const targetLinePattern = /<p>For: <strong>(HIG AI AUTOMATION LLP|HIGAI AUTOMATION LLP|HIG AI AUTOMATION|HIGAI AUTOMATION)<\/strong><\/p>\s*<div class="sig-line"><\/div>/g;
              doc.compiledHtml = doc.compiledHtml.replace(targetLinePattern, (match, companyName) => {
                return `<p>For: <strong>${companyName}</strong></p><div class="sig-line" style="border-bottom: none; margin-top: 10px; margin-bottom: 0px; height: auto;">${activeCeoBlock}</div><div class="sig-line" style="margin-top: 5px;"></div>`;
              });
            }
            doc.compiledHtml = doc.compiledHtml.replace('Mr. Ajay S', 'Mr. Ajay S (Digitally Signed)');
          }
        }
      }
    }

    return docs;
  }

  async createTemplate(tenantId: string, name: string, category: string, contentHtml: string) {
    return this.prisma.documentTemplate.create({
      data: { tenantId, name, category, contentHtml },
    });
  }

  async signDocument(tenantId: string, id: string, signatureData: string) {
    const doc = await this.prisma.generatedDocument.findFirst({
      where: { id, tenantId },
    });

    if (!doc || !doc.compiledHtml) {
      throw new Error('Document not found or cannot be signed.');
    }

    // Basic HTML injection: insert the signature image just before the Authorized Signature line or at the bottom
    let updatedHtml = doc.compiledHtml;

    const signatureHtml = `<div style="display: flex; align-items: center; gap: 10px; margin-top: 5px; margin-bottom: 5px;"><img src="${signatureData}" alt="Signature" style="height: 55px; width: auto; max-width: 180px; object-fit: contain;" /><div style="display: flex; flex-direction: column; justify-content: center; font-size: 8px; color: #10b981; border-left: 1px solid #e2e8f0; padding-left: 8px; font-family: 'Inter', sans-serif; line-height: 1.2; text-align: left;"><span style="font-weight: bold; display: flex; align-items: center; gap: 3px; color: #10b981;"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>Digitally Signed</span><span style="color: #64748b;">Verified Client</span><span style="color: #64748b;">Date: ${new Date().toLocaleDateString()}</span></div></div>`;

    if (updatedHtml.includes('<div class="sig-line client-sig-line"></div>')) {
      updatedHtml = updatedHtml.replace('<div class="sig-line client-sig-line"></div>', `<div class="sig-line client-sig-line" style="border-bottom: none; margin-top: 10px; margin-bottom: 0px; height: auto;">${signatureHtml}</div><div class="sig-line" style="margin-top: 5px;"></div>`);
    } else if (updatedHtml.includes('<div class="sig-line"></div>')) {
      const searchStr = '<div class="sig-line"></div>';
      const lastIndex = updatedHtml.lastIndexOf(searchStr);
      if (lastIndex !== -1) {
        updatedHtml = updatedHtml.substring(0, lastIndex) +
          `<div class="sig-line" style="border-bottom: none; margin-top: 10px; margin-bottom: 0px; height: auto;">${signatureHtml}</div><div class="sig-line" style="margin-top: 5px;"></div>` +
          updatedHtml.substring(lastIndex + searchStr.length);
      }
    } else {
      // Fallback: append at the end of the document body wrapper
      updatedHtml = updatedHtml + `<div class="injected-signature" style="page-break-inside: avoid; text-align: right; padding-right: 50px; margin-top: 50px;">
        <p><strong>Authorized E-Signature</strong></p>
        ${signatureHtml}
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>`;
    }

    // Use raw MongoDB command to bypass Prisma schema validation since we can't regenerate the client while the server is running
    const response = await this.prisma.$runCommandRaw({
      update: 'GeneratedDocument',
      updates: [
        {
          q: { _id: id, tenantId },
          u: {
            $set: {
              compiledHtml: updatedHtml,
              status: 'signed',
              signatureData: signatureData,
              signedAt: { $date: new Date().toISOString() }
            }
          }
        }
      ]
    });

    return this.getDocument(tenantId, id);
  }

  async unsignDocument(tenantId: string, id: string) {
    const doc = await this.prisma.generatedDocument.findFirst({
      where: { id, tenantId },
    });

    if (!doc || !doc.compiledHtml) {
      throw new Error('Document not found or cannot be unsigned.');
    }

    let updatedHtml = doc.compiledHtml;

    // Strip client-sig-line injected block
    const clientSigRegex = /<div class="sig-line client-sig-line" style="[^"]*">[\s\S]*?<\/div><div class="sig-line" style="margin-top: 5px;"><\/div>/g;
    updatedHtml = updatedHtml.replace(clientSigRegex, '<div class="sig-line client-sig-line"></div>');

    // Strip standard sig-line injected block
    const standardSigRegex = /<div class="sig-line" style="[^"]*">[\s\S]*?<\/div><div class="sig-line" style="margin-top: 5px;"><\/div>/g;
    updatedHtml = updatedHtml.replace(standardSigRegex, '<div class="sig-line"></div>');

    // Strip fallback injected block
    const fallbackRegex = /<div class="injected-signature"[^>]*>[\s\S]*?<\/div>/g;
    updatedHtml = updatedHtml.replace(fallbackRegex, '');

    const response = await this.prisma.$runCommandRaw({
      update: 'GeneratedDocument',
      updates: [
        {
          q: { _id: id, tenantId },
          u: {
            $set: {
              compiledHtml: updatedHtml,
              status: 'draft',
              signatureData: null
            },
            $unset: {
              signedAt: ""
            }
          }
        }
      ]
    });

    return this.getDocument(tenantId, id);
  }
}
