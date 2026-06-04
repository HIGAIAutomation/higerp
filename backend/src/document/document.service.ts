import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) { }

  async generateDocument(templateName: string, tenantId: string, data: any, entityType: string, entityId: string) {
    console.log(`[DOCUMENT] Generating document: ${templateName} for ${entityType} ${entityId}`);
    
    const template = await this.prisma.documentTemplate.findFirst({
      where: { name: templateName, tenantId },
      orderBy: { createdAt: 'desc' },
    });

    if (!template) {
      const error = `Template ${templateName} not found for tenant ${tenantId}`;
      console.error(`[DOCUMENT] ${error}`);
      throw new Error(error);
    }

    console.log(`[DOCUMENT] Found template: ${templateName} (ID: ${template.id})`);

    if (!Handlebars.helpers['or']) {
      Handlebars.registerHelper('or', function (a, b) {
        return a || b;
      });
    }
    
    try {
      const compiledTemplate = Handlebars.compile(template.contentHtml);
      const contentHtml = compiledTemplate(data);
      console.log(`[DOCUMENT] Template compiled successfully`);
    } catch (compileError) {
      console.error(`[DOCUMENT] Template compilation error:`, compileError);
      throw compileError;
    }

    const existingDoc = await this.prisma.generatedDocument.findFirst({
      where: {
        tenantId,
        templateId: template.id,
        entityType,
        entityId,
      },
    });

    const compiledTemplate = Handlebars.compile(template.contentHtml);
    const contentHtml = compiledTemplate(data);

    if (existingDoc) {
      console.log(`[DOCUMENT] Updating existing document: ${existingDoc.id}`);
      return this.prisma.generatedDocument.update({
        where: { id: existingDoc.id },
        data: {
          compiledHtml: contentHtml,
          status: 'generated',
        },
      });
    }

    console.log(`[DOCUMENT] Creating new document for ${templateName}`);
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
      const fs = require('fs');
      const path = require('path');
      const logoPath = path.resolve(process.cwd(), 'public/logo.png');
      let logoBase64 = '';
      if (fs.existsSync(logoPath)) {
        logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
      }

      if (logoBase64) {
        doc.compiledHtml = doc.compiledHtml.replace(
          /https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/logo\.png/g,
          logoBase64
        );
        doc.compiledHtml = doc.compiledHtml.replace(/src="\/logo\.png"/g, `src="${logoBase64}"`);
        doc.compiledHtml = doc.compiledHtml.replace(/src='\/logo\.png'/g, `src="${logoBase64}"`);
      } else {
        doc.compiledHtml = doc.compiledHtml.replace(
          /https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/logo\.png/g,
          process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/logo.png` : 'https://higerp.onrender.com/logo.png'
        );
      }

      // Branding overrides to position the logo inline on the left of the company details
      const brandingOverride = `
<style>
  .header-branding {
    display: flex !important;
    align-items: center !important;
    gap: 15px !important;
    justify-content: flex-start !important;
    float: none !important;
  }
  .company-logo {
    float: none !important;
    display: block !important;
    max-height: 48px !important;
    width: auto !important;
  }
  .company-details {
    float: none !important;
    text-align: left !important;
  }
</style>
`;
      if (doc.compiledHtml.includes('</style>')) {
        doc.compiledHtml = doc.compiledHtml.replace('</style>', `</style>${brandingOverride}`);
      }

      // 1. Always replace the generic left column signature label with CEO details
      const robustLabelPattern = /<p>For: <strong>(HIG AI AUTOMATION LLP|HIGAI AUTOMATION LLP|HIG AI AUTOMATION|HIGAI AUTOMATION)<\/strong><\/p>\s*(<div class="sig-line"(?: style="[^"]*")?>[\s\S]*?<\/div>)\s*<p class="sig-label">(?:Authorized Signature|Authorized Signatory|Authorized Representative|Authorized Lead)<\/p>/g;
      doc.compiledHtml = doc.compiledHtml.replace(robustLabelPattern, (match, companyName, sigLine) => {
        return `<p>For: <strong>${companyName}</strong></p>
      ${sigLine}
      <p class="sig-label" style="text-transform: none; font-weight: bold; font-size: 13px; color: #0f172a; margin-top: 5px;">Mr. Ajay S</p>
      <p class="sig-label" style="text-transform: none; font-size: 11px; color: #475569; margin-top: 2px;">CEO of HIGAI Automation LLP</p>`;
      });

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

      // Convert layout to aligned table format
      doc.compiledHtml = this.alignSignatures(doc.compiledHtml);
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
            .page-border {
              display: none;
            }
            @page {
              size: Letter;
              margin: 15mm 15mm 15mm 15mm;
            }
            @media print {
              .page-border {
                display: block;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border: 1px solid #94a3b8;
                pointer-events: none;
                z-index: 9999;
                box-sizing: border-box;
              }
              body {
                padding: 15px !important;
                margin: 0 !important;
                box-sizing: border-box !important;
              }
              .contract-container {
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
              }
              .section {
                margin-bottom: 20px !important;
                page-break-inside: auto !important;
                break-inside: auto !important;
              }
              .section p, .section li {
                page-break-inside: auto !important;
                break-inside: auto !important;
                orphans: 3 !important;
                widows: 3 !important;
              }
              h1, h2, h3, h4 {
                page-break-after: avoid !important;
                break-after: avoid !important;
              }
            }
          </style>
        </head>
        <body style="position: relative;">
          <div class="page-border"></div>
          <div class="legal-document-wrapper">
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
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
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
    const logoPath = path.resolve(process.cwd(), 'public/logo.png');
    let logoBase64 = '';
    if (fs.existsSync(logoPath)) {
      logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
    }

    const brandingOverride = `
<style>
  .header-branding {
    display: flex !important;
    align-items: center !important;
    gap: 15px !important;
    justify-content: flex-start !important;
    float: none !important;
  }
  .company-logo {
    float: none !important;
    display: block !important;
    max-height: 48px !important;
    width: auto !important;
  }
  .company-details {
    float: none !important;
    text-align: left !important;
  }
</style>
`;

    // 1. Always replace the generic left column signature label with CEO details
    const robustLabelPattern = /<p>For: <strong>(HIG AI AUTOMATION LLP|HIGAI AUTOMATION LLP|HIG AI AUTOMATION|HIGAI AUTOMATION)<\/strong><\/p>\s*(<div class="sig-line"(?: style="[^"]*")?>[\s\S]*?<\/div>)\s*<p class="sig-label">(?:Authorized Signature|Authorized Signatory|Authorized Representative|Authorized Lead)<\/p>/g;
    for (const doc of docs) {
      if (doc.compiledHtml) {
        if (logoBase64) {
          doc.compiledHtml = doc.compiledHtml.replace(
            /https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/logo\.png/g,
            logoBase64
          );
          doc.compiledHtml = doc.compiledHtml.replace(/src="\/logo\.png"/g, `src="${logoBase64}"`);
          doc.compiledHtml = doc.compiledHtml.replace(/src='\/logo\.png'/g, `src="${logoBase64}"`);
        } else {
          doc.compiledHtml = doc.compiledHtml.replace(
            /https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/logo\.png/g,
            process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/logo.png` : 'https://higerp.onrender.com/logo.png'
          );
        }

        if (doc.compiledHtml.includes('</style>')) {
          doc.compiledHtml = doc.compiledHtml.replace('</style>', `</style>${brandingOverride}`);
        }

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

    // Convert layouts to aligned table format for all docs
    for (const doc of docs) {
      if (doc.compiledHtml) {
        doc.compiledHtml = this.alignSignatures(doc.compiledHtml);
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

  private alignSignatures(html: string): string {
    const sigsStart = html.indexOf('<div class="signatures">');
    if (sigsStart === -1) return html;

    let openDivs = 1;
    let currentIndex = sigsStart + '<div class="signatures">'.length;
    while (openDivs > 0 && currentIndex < html.length) {
      const nextOpen = html.indexOf('<div', currentIndex);
      const nextClose = html.indexOf('</div>', currentIndex);

      if (nextClose === -1) break;

      if (nextOpen !== -1 && nextOpen < nextClose) {
        openDivs++;
        currentIndex = nextOpen + 4;
      } else {
        openDivs--;
        currentIndex = nextClose + 6;
      }
    }

    const signaturesBlockHtml = html.substring(sigsStart, currentIndex);

    const cols: string[] = [];
    let colSearch = 0;
    while (true) {
      const colStart = signaturesBlockHtml.indexOf('<div class="sig-col"', colSearch);
      if (colStart === -1) break;

      let colOpenDivs = 1;
      let colIndex = signaturesBlockHtml.indexOf('>', colStart) + 1;
      while (colOpenDivs > 0 && colIndex < signaturesBlockHtml.length) {
        const nextOpen = signaturesBlockHtml.indexOf('<div', colIndex);
        const nextClose = signaturesBlockHtml.indexOf('</div>', colIndex);

        if (nextClose === -1) break;

        if (nextOpen !== -1 && nextOpen < nextClose) {
          colOpenDivs++;
          colIndex = nextOpen + 4;
        } else {
          colOpenDivs--;
          colIndex = nextClose + 6;
        }
      }
      cols.push(signaturesBlockHtml.substring(colStart, colIndex));
      colSearch = colIndex;
    }

    if (cols.length < 2) return html;

    const companyNameMatch = cols[0].match(/For:\s*<strong>([\s\S]*?)<\/strong>/);
    const companyName = companyNameMatch ? companyNameMatch[1].trim() : 'HIG AI AUTOMATION LLP';

    const clientNameMatch = cols[1].match(/For:\s*<strong>([\s\S]*?)<\/strong>/);
    const clientName = clientNameMatch ? clientNameMatch[1].trim() : 'Client';

    const companyHeaderEnd = cols[0].indexOf('</strong></p>') + '</strong></p>'.length;
    let companyLabelStart = cols[0].indexOf('Mr. Ajay S');
    if (companyLabelStart === -1) {
      companyLabelStart = cols[0].indexOf('<p class="sig-label"');
    }
    if (companyLabelStart === -1) {
      companyLabelStart = cols[0].indexOf('<p class="sig-label">');
    }

    let companySigContent = '';
    if (companyLabelStart !== -1 && companyLabelStart > companyHeaderEnd) {
      companySigContent = cols[0].substring(companyHeaderEnd, companyLabelStart).trim();
    }
    companySigContent = companySigContent.replace(/<div class="sig-line"[\s\S]*?><\/div>/g, '').trim();
    companySigContent = companySigContent.replace(/<div class="sig-line"><\/div>/g, '').trim();

    const clientHeaderEnd = cols[1].indexOf('</strong></p>') + '</strong></p>'.length;
    let clientLabelStart = cols[1].indexOf('<p class="sig-label"');
    if (clientLabelStart === -1) {
      clientLabelStart = cols[1].indexOf('<p class="sig-label">');
    }

    let clientSigContent = '';
    if (clientLabelStart !== -1 && clientLabelStart > clientHeaderEnd) {
      clientSigContent = cols[1].substring(clientHeaderEnd, clientLabelStart).trim();
    }
    clientSigContent = clientSigContent.replace(/<div class="sig-line"[\s\S]*?><\/div>/g, '').trim();
    clientSigContent = clientSigContent.replace(/<div class="sig-line"><\/div>/g, '').trim();

    const clientLabelMatch = cols[1].match(/<p class="sig-label"[\s\S]*?>([\s\S]*?)<\/p>/);
    const clientLabel = clientLabelMatch ? clientLabelMatch[1].trim() : 'Authorized Signature';

    const companyDateMatch = cols[0].match(/Date:\s*([\s\S]*?)(?:<\/p>|<br|\n)/i);
    const companyDate = companyDateMatch ? companyDateMatch[1].trim() : '______________';

    const clientDateMatch = cols[1].match(/Date:\s*([\s\S]*?)(?:<\/p>|<br|\n)/i);
    const clientDate = clientDateMatch ? clientDateMatch[1].trim() : '______________';

    const tableHtml = `
<table style="width: 100%; border-collapse: collapse; margin-top: 40px; page-break-inside: avoid; font-family: 'Inter', sans-serif;">
  <tr>
    <td style="width: 45%; vertical-align: bottom; padding-bottom: 5px;">
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a;">For: <strong>${companyName}</strong></p>
      <div style="min-height: 65px; display: flex; align-items: center; justify-content: flex-start; margin-bottom: 5px;">
        ${companySigContent || '<div style="height: 45px;"></div>'}
      </div>
    </td>
    <td style="width: 10%;"></td>
    <td style="width: 45%; vertical-align: bottom; padding-bottom: 5px;">
      <p style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a;">For: <strong>${clientName}</strong></p>
      <div style="min-height: 65px; display: flex; align-items: center; justify-content: flex-start; margin-bottom: 5px;">
        ${clientSigContent || '<div style="height: 45px;"></div>'}
      </div>
    </td>
  </tr>
  <tr>
    <td style="border-top: 1.5px solid #0f172a; padding-top: 8px; font-size: 11px; vertical-align: top; line-height: 1.4;">
      <p style="margin: 0; font-weight: bold; font-size: 12.5px; color: #0f172a; text-transform: none;">Mr. Ajay S</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #475569; text-transform: none;">CEO of HIGAI Automation LLP</p>
      <p style="margin: 6px 0 0 0; color: #64748b; font-size: 11px;">Date: ${companyDate}</p>
    </td>
    <td></td>
    <td style="border-top: 1.5px solid #0f172a; padding-top: 8px; font-size: 11px; vertical-align: top; line-height: 1.4;">
      <p style="margin: 0; font-weight: bold; font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">${clientLabel}</p>
      <p style="margin: 6px 0 0 0; color: #64748b; font-size: 11px;">Date: ${clientDate}</p>
    </td>
  </tr>
</table>
    `.trim();

    return html.substring(0, sigsStart) + tableHtml + html.substring(currentIndex);
  }
}
