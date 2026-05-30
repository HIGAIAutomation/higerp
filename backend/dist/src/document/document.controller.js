"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const common_1 = require("@nestjs/common");
const document_service_1 = require("./document.service");
const passport_1 = require("@nestjs/passport");
let DocumentController = class DocumentController {
    documentService;
    constructor(documentService) {
        this.documentService = documentService;
    }
    async getDocumentsForEntity(entityType, entityId, req) {
        return this.documentService.getDocumentsForEntity(req.user.tenantId, entityId, entityType.toUpperCase());
    }
    async downloadDocument(id, req, res) {
        const doc = await this.documentService.getDocument(req.user.tenantId, id);
        if (!doc || !doc.compiledHtml) {
            res.status(404).send('Document not found or compiled layout is empty.');
            return;
        }
        const filename = `${doc.template?.name || 'document'}.html`.replace(/\s+/g, '_');
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(doc.compiledHtml);
    }
    async downloadPdf(id, req, res) {
        try {
            const pdfBuffer = await this.documentService.generatePdf(req.user.tenantId, id);
            const doc = await this.documentService.getDocument(req.user.tenantId, id);
            const filename = `${doc?.template?.name || 'document'}.pdf`.replace(/\s+/g, '_');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error('Error in downloadPdf:', error);
            res.status(500).send(`Failed to generate PDF: ${error.message}`);
        }
    }
    async renderPdf(body, res) {
        try {
            const puppeteer = require('puppeteer');
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            try {
                const page = await browser.newPage();
                await page.setContent(body.htmlContent, { waitUntil: 'networkidle0' });
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
                const filename = (body.filename || 'report.pdf').replace(/\s+/g, '_');
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(Buffer.from(pdfBuffer));
            }
            finally {
                await browser.close();
            }
        }
        catch (error) {
            console.error('Error in renderPdf:', error);
            res.status(500).send(`Failed to render PDF: ${error.message}`);
        }
    }
    async getDocument(id, req) {
        return this.documentService.getDocument(req.user.tenantId, id);
    }
};
exports.DocumentController = DocumentController;
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getDocumentsForEntity", null);
__decorate([
    (0, common_1.Get)('/:id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "downloadDocument", null);
__decorate([
    (0, common_1.Get)('/:id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Post)('/render-pdf'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "renderPdf", null);
__decorate([
    (0, common_1.Get)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getDocument", null);
exports.DocumentController = DocumentController = __decorate([
    (0, common_1.Controller)('document'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [document_service_1.DocumentService])
], DocumentController);
//# sourceMappingURL=document.controller.js.map