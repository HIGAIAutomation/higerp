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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const document_service_1 = require("../document/document.service");
let ProjectService = class ProjectService {
    prisma;
    documentService;
    constructor(prisma, documentService) {
        this.prisma = prisma;
        this.documentService = documentService;
    }
    async createProject(tenantId, data) {
        const project = await this.prisma.project.create({
            data: {
                tenantId,
                name: data.name,
                category: data.category || 'Web/App Development',
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                status: 'active',
                whatsappNumber: data.whatsappNumber || null,
                price: data.price ? parseFloat(data.price) : 0,
                modules: data.modules || null,
                deliveryCode: !!data.deliveryCode,
                deliveryDocs: !!data.deliveryDocs,
                deliveryDb: !!data.deliveryDb,
                deliveryQa: !!data.deliveryQa,
                deliveryPayment: !!data.deliveryPayment,
                postCount: data.postCount !== undefined ? parseInt(data.postCount, 10) : 0,
                videoCount: data.videoCount !== undefined ? parseInt(data.videoCount, 10) : 0,
            },
        });
        const lifecycleDocs = [
            'Non-Disclosure Agreement (NDA) - Client',
            'Master Service Agreement (MSA)',
            'Statement of Work (SOW)',
            'Project Proposal',
            'Service Level Agreement (SLA)',
            'Intellectual Property Agreement',
            'Data Processing Agreement (DPA)',
        ];
        for (const docName of lifecycleDocs) {
            try {
                await this.documentService.generateDocument(docName, tenantId, {
                    projectName: project.name,
                    clientName: data.clientName || 'Valued Client',
                    companyName: 'HIG AI Automation LLP',
                    startDate: project.startDate?.toLocaleDateString()
                }, 'PROJECT', project.id);
            }
            catch (error) {
                console.error(`Failed to auto-generate project doc ${docName}: ${error.message}`);
            }
        }
        return project;
    }
    async getProjects(tenantId) {
        return this.prisma.project.findMany({
            where: { tenantId },
        });
    }
    async updateProject(id, tenantId, data) {
        const currentProject = await this.prisma.project.findUnique({
            where: { id, tenantId },
        });
        if (!currentProject) {
            throw new common_1.NotFoundException('Project not found');
        }
        const oldModules = currentProject.modules
            ? currentProject.modules.split(',').map((m) => m.trim()).filter(Boolean)
            : [];
        const newModules = data.modules
            ? data.modules.split(',').map((m) => m.trim()).filter(Boolean)
            : [];
        if (newModules.length > oldModules.length) {
            const oldPrice = Number(currentProject.price || 0);
            const newPrice = Number(data.price || 0);
            if (newPrice <= oldPrice) {
                throw new common_1.BadRequestException('Target modules count has increased. You must increase the project price.');
            }
            if (!data.endDate) {
                throw new common_1.BadRequestException('Target modules count has increased. You must specify an estimated end date extension.');
            }
            const oldEndDate = currentProject.endDate ? new Date(currentProject.endDate).getTime() : null;
            const newEndDate = new Date(data.endDate).getTime();
            if (oldEndDate && newEndDate <= oldEndDate) {
                throw new common_1.BadRequestException('Target modules count has increased. You must extend the estimated end date.');
            }
        }
        const isCompleted = data.status === 'completed';
        if (isCompleted) {
            const deliveryCode = data.deliveryCode !== undefined ? !!data.deliveryCode : !!currentProject.deliveryCode;
            const deliveryDocs = data.deliveryDocs !== undefined ? !!data.deliveryDocs : !!currentProject.deliveryDocs;
            const deliveryDb = data.deliveryDb !== undefined ? !!data.deliveryDb : !!currentProject.deliveryDb;
            const deliveryQa = data.deliveryQa !== undefined ? !!data.deliveryQa : !!currentProject.deliveryQa;
            const deliveryPayment = data.deliveryPayment !== undefined ? !!data.deliveryPayment : !!currentProject.deliveryPayment;
            if (!deliveryCode || !deliveryDocs || !deliveryDb || !deliveryQa || !deliveryPayment) {
                throw new common_1.BadRequestException('Cannot complete the project until all 5 delivery checklist items are completed.');
            }
        }
        return this.prisma.project.update({
            where: { id, tenantId },
            data: {
                name: data.name,
                category: data.category,
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                status: data.status || 'active',
                whatsappNumber: data.whatsappNumber,
                price: data.price !== undefined ? parseFloat(data.price) : undefined,
                modules: data.modules,
                deliveryCode: data.deliveryCode !== undefined ? !!data.deliveryCode : undefined,
                deliveryDocs: data.deliveryDocs !== undefined ? !!data.deliveryDocs : undefined,
                deliveryDb: data.deliveryDb !== undefined ? !!data.deliveryDb : undefined,
                deliveryQa: data.deliveryQa !== undefined ? !!data.deliveryQa : undefined,
                deliveryPayment: data.deliveryPayment !== undefined ? !!data.deliveryPayment : undefined,
                postCount: data.postCount !== undefined ? parseInt(data.postCount, 10) : undefined,
                videoCount: data.videoCount !== undefined ? parseInt(data.videoCount, 10) : undefined,
            },
        });
    }
    async deleteProject(id, tenantId) {
        await this.prisma.generatedDocument.deleteMany({
            where: { entityId: id, entityType: 'PROJECT', tenantId },
        });
        return this.prisma.project.delete({
            where: { id, tenantId },
        });
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_service_1.DocumentService])
], ProjectService);
//# sourceMappingURL=project.service.js.map