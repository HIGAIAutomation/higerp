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
    async getDocument(tenantId, id) {
        return this.prisma.generatedDocument.findFirst({
            where: { id, tenantId },
            include: { template: true },
        });
    }
    async getDocumentsForEntity(tenantId, entityId, entityType) {
        return this.prisma.generatedDocument.findMany({
            where: { tenantId, entityId, entityType },
            include: { template: true },
        });
    }
    async createTemplate(tenantId, name, category, contentHtml) {
        return this.prisma.documentTemplate.create({
            data: { tenantId, name, category, contentHtml },
        });
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentService);
//# sourceMappingURL=document.service.js.map