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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const document_service_1 = require("../document/document.service");
let CrmService = class CrmService {
    prisma;
    documentService;
    constructor(prisma, documentService) {
        this.prisma = prisma;
        this.documentService = documentService;
    }
    async createLead(tenantId, data) {
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
    async createPackage(tenantId, data) {
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
    async generateQuote(tenantId, leadId, packageId) {
        const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
        const pkg = await this.prisma.package.findUnique({
            where: { id: packageId },
            include: { tiers: true }
        });
        if (!lead || !pkg)
            throw new Error('Lead or Package not found');
        const quoteData = {
            clientName: lead.companyName,
            packageName: pkg.name,
            basePrice: pkg.basePrice,
            tiers: pkg.tiers,
            companyName: 'HIG AI Automation LLP',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        };
        return this.documentService.generateDocument('Sales Quotation', tenantId, quoteData, 'LEAD', leadId);
    }
    async getLeads(tenantId) {
        return this.prisma.lead.findMany({
            where: { tenantId },
            include: { opportunities: true },
        });
    }
    async getPackages(tenantId) {
        return this.prisma.package.findMany({
            where: { tenantId },
            include: { tiers: true },
        });
    }
};
exports.CrmService = CrmService;
exports.CrmService = CrmService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_service_1.DocumentService])
], CrmService);
//# sourceMappingURL=crm.service.js.map