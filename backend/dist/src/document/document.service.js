"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const Handlebars = __importStar(require("handlebars"));
let DocumentService = class DocumentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateDocument(templateName, tenantId, data, entityType, entityId) {
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
    async getDocument(tenantId, id) {
        const doc = await this.prisma.generatedDocument.findFirst({
            where: { id, tenantId },
            include: { template: true },
        });
        if (doc && doc.compiledHtml) {
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
                    }
                    else {
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
    async generatePdf(tenantId, id) {
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
        }
        finally {
            await browser.close();
        }
    }
    async getDocumentsForEntity(tenantId, entityId, entityType) {
        const docs = await this.prisma.generatedDocument.findMany({
            where: { tenantId, entityId, entityType },
            include: { template: true },
        });
        const fs = require('fs');
        const path = require('path');
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
                        }
                        else {
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
    async createTemplate(tenantId, name, category, contentHtml) {
        return this.prisma.documentTemplate.create({
            data: { tenantId, name, category, contentHtml },
        });
    }
    async signDocument(tenantId, id, signatureData) {
        const doc = await this.prisma.generatedDocument.findFirst({
            where: { id, tenantId },
        });
        if (!doc || !doc.compiledHtml) {
            throw new Error('Document not found or cannot be signed.');
        }
        let updatedHtml = doc.compiledHtml;
        const signatureHtml = `<div style="display: flex; align-items: center; gap: 10px; margin-top: 5px; margin-bottom: 5px;"><img src="${signatureData}" alt="Signature" style="height: 55px; width: auto; max-width: 180px; object-fit: contain;" /><div style="display: flex; flex-direction: column; justify-content: center; font-size: 8px; color: #10b981; border-left: 1px solid #e2e8f0; padding-left: 8px; font-family: 'Inter', sans-serif; line-height: 1.2; text-align: left;"><span style="font-weight: bold; display: flex; align-items: center; gap: 3px; color: #10b981;"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>Digitally Signed</span><span style="color: #64748b;">Verified Client</span><span style="color: #64748b;">Date: ${new Date().toLocaleDateString()}</span></div></div>`;
        if (updatedHtml.includes('<div class="sig-line client-sig-line"></div>')) {
            updatedHtml = updatedHtml.replace('<div class="sig-line client-sig-line"></div>', `<div class="sig-line client-sig-line" style="border-bottom: none; margin-top: 10px; margin-bottom: 0px; height: auto;">${signatureHtml}</div><div class="sig-line" style="margin-top: 5px;"></div>`);
        }
        else if (updatedHtml.includes('<div class="sig-line"></div>')) {
            const searchStr = '<div class="sig-line"></div>';
            const lastIndex = updatedHtml.lastIndexOf(searchStr);
            if (lastIndex !== -1) {
                updatedHtml = updatedHtml.substring(0, lastIndex) +
                    `<div class="sig-line" style="border-bottom: none; margin-top: 10px; margin-bottom: 0px; height: auto;">${signatureHtml}</div><div class="sig-line" style="margin-top: 5px;"></div>` +
                    updatedHtml.substring(lastIndex + searchStr.length);
            }
        }
        else {
            updatedHtml = updatedHtml + `<div class="injected-signature" style="page-break-inside: avoid; text-align: right; padding-right: 50px; margin-top: 50px;">
        <p><strong>Authorized E-Signature</strong></p>
        ${signatureHtml}
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>`;
        }
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
    async unsignDocument(tenantId, id) {
        const doc = await this.prisma.generatedDocument.findFirst({
            where: { id, tenantId },
        });
        if (!doc || !doc.compiledHtml) {
            throw new Error('Document not found or cannot be unsigned.');
        }
        let updatedHtml = doc.compiledHtml;
        const clientSigRegex = /<div class="sig-line client-sig-line" style="[^"]*">[\s\S]*?<\/div><div class="sig-line" style="margin-top: 5px;"><\/div>/g;
        updatedHtml = updatedHtml.replace(clientSigRegex, '<div class="sig-line client-sig-line"></div>');
        const standardSigRegex = /<div class="sig-line" style="[^"]*">[\s\S]*?<\/div><div class="sig-line" style="margin-top: 5px;"><\/div>/g;
        updatedHtml = updatedHtml.replace(standardSigRegex, '<div class="sig-line"></div>');
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
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentService);
//# sourceMappingURL=document.service.js.map