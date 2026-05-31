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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const document_service_1 = require("../document/document.service");
const bcrypt = __importStar(require("bcrypt"));
let ProjectService = class ProjectService {
    prisma;
    documentService;
    constructor(prisma, documentService) {
        this.prisma = prisma;
        this.documentService = documentService;
    }
    async createProject(tenantId, data) {
        let clientId = null;
        if (data.clientUsername) {
            const existingUser = await this.prisma.user.findFirst({
                where: { username: data.clientUsername, tenantId },
            });
            if (existingUser) {
                clientId = existingUser.id;
            }
            else {
                if (!data.clientPassword) {
                    throw new common_1.BadRequestException('Password is required for client account');
                }
                const hashedPassword = await bcrypt.hash(data.clientPassword, 10);
                const clientUser = await this.prisma.user.create({
                    data: {
                        tenantId,
                        email: `${data.clientUsername.toLowerCase()}@hig-client.com`,
                        username: data.clientUsername,
                        password: hashedPassword,
                        role: 'user',
                        pageAccess: ['/dashboard', '/dashboard/projects'],
                    },
                });
                clientId = clientUser.id;
            }
        }
        const project = await this.prisma.project.create({
            data: {
                tenantId,
                clientId,
                clientName: data.clientName || null,
                name: data.name,
                category: data.category || 'Web/App Development',
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                status: 'active',
                whatsappNumber: data.whatsappNumber || null,
                price: data.price ? parseFloat(data.price) : 0,
                modules: data.modules || null,
                platforms: data.platforms || null,
                deliveryCode: !!data.deliveryCode,
                deliveryDocs: !!data.deliveryDocs,
                deliveryDb: !!data.deliveryDb,
                deliveryQa: !!data.deliveryQa,
                deliveryPayment: !!data.deliveryPayment,
                postCount: data.postCount !== undefined ? parseInt(data.postCount, 10) : 0,
                videoCount: data.videoCount !== undefined ? parseInt(data.videoCount, 10) : 0,
                socialCredentials: data.socialCredentials || null,
                moduleDetails: data.moduleDetails || null,
                projectInclusions: data.projectInclusions || null,
            },
        });
        if (project.category === 'Web/App Development' && project.price > 0) {
            const invoiceBase = `INV-PROJ-${project.id}`;
            await this.prisma.projectPayment.create({
                data: {
                    tenantId,
                    projectId: project.id,
                    invoiceNumber: `${invoiceBase}-ADVANCE`,
                    amount: parseFloat((project.price * 0.25).toFixed(2)),
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    status: 'pending',
                    whatsappSent: false,
                }
            });
        }
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
                let finalClientName = project.clientName || data.clientName;
                if ((!finalClientName || finalClientName.trim() === '') && clientId) {
                    const clientUser = await this.prisma.user.findUnique({ where: { id: clientId } });
                    if (clientUser) {
                        finalClientName = clientUser.username;
                    }
                }
                if (!finalClientName || finalClientName.trim() === '') {
                    finalClientName = 'Valued Client';
                }
                await this.documentService.generateDocument(docName, tenantId, {
                    projectName: project.name,
                    clientName: finalClientName,
                    companyName: 'HIG AI Automation LLP',
                    startDate: project.startDate ? new Date(project.startDate).toLocaleDateString() : '____________',
                    endDate: project.endDate ? new Date(project.endDate).toLocaleDateString() : '____________',
                    price: project.price ? `₹${project.price.toLocaleString('en-IN')}` : '₹6,000.00',
                    postCount: project.postCount || 15,
                    videoCount: project.videoCount || 6,
                    isWebProject: project.category === 'Web/App Development',
                    isDigitalMarketing: project.category === 'Digital Marketing',
                    isAutomation: project.category === 'Automation',
                    isAiDevelopment: project.category === 'AI Development',
                    moduleDetails: project.moduleDetails || [],
                    projectInclusions: project.projectInclusions || '',
                    inclusions: project.projectInclusions ? project.projectInclusions.split(/[,\n]+/).map((x) => x.trim()).filter(Boolean) : [],
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
            include: {
                adCampaigns: true,
                client: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                    }
                }
            }
        });
    }
    async updateProject(id, tenantId, data, clientIdFilter) {
        const currentProject = await this.prisma.project.findUnique({
            where: { id, tenantId },
        });
        if (!currentProject) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (clientIdFilter) {
            if (currentProject.clientId !== clientIdFilter) {
                throw new common_1.BadRequestException('Forbidden: You do not own this project');
            }
            return this.prisma.project.update({
                where: { id, tenantId },
                data: {
                    socialCredentials: data.socialCredentials !== undefined ? data.socialCredentials : undefined,
                },
            });
        }
        let clientId = currentProject.clientId;
        if (data.clientUsername) {
            const existingUser = await this.prisma.user.findFirst({
                where: { username: data.clientUsername, tenantId },
            });
            if (existingUser) {
                clientId = existingUser.id;
            }
            else {
                if (clientId) {
                    const userUpdateData = { username: data.clientUsername };
                    if (data.clientPassword) {
                        userUpdateData.password = await bcrypt.hash(data.clientPassword, 10);
                    }
                    await this.prisma.user.update({
                        where: { id: clientId },
                        data: userUpdateData,
                    });
                }
                else {
                    if (!data.clientPassword) {
                        throw new common_1.BadRequestException('Password is required for a new client account');
                    }
                    const hashedPassword = await bcrypt.hash(data.clientPassword, 10);
                    const clientUser = await this.prisma.user.create({
                        data: {
                            tenantId,
                            email: `${data.clientUsername.toLowerCase()}@hig-client.com`,
                            username: data.clientUsername,
                            password: hashedPassword,
                            role: 'user',
                            pageAccess: ['/dashboard', '/dashboard/projects'],
                        },
                    });
                    clientId = clientUser.id;
                }
            }
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
        const newModuleDetails = data.moduleDetails;
        if (newModuleDetails && Array.isArray(newModuleDetails) && newModuleDetails.length > 0) {
            const totalModules = newModuleDetails.length;
            const completedModules = newModuleDetails.filter((m) => m.completed).length;
            const completionPercentage = completedModules / totalModules;
            const projectPrice = parseFloat(data.price || currentProject.price || 0);
            const invoiceBase = `INV-PROJ-${id}`;
            const partAmount = parseFloat((projectPrice * 0.25).toFixed(2));
            if (completionPercentage >= 0.33) {
                const existPart1 = await this.prisma.projectPayment.findFirst({
                    where: { projectId: id, invoiceNumber: `${invoiceBase}-PART1`, tenantId }
                });
                if (!existPart1) {
                    await this.prisma.projectPayment.create({
                        data: {
                            tenantId,
                            projectId: id,
                            invoiceNumber: `${invoiceBase}-PART1`,
                            amount: partAmount,
                            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            status: 'pending',
                            whatsappSent: false,
                        }
                    });
                }
            }
            if (completionPercentage >= 0.66) {
                const existPart2 = await this.prisma.projectPayment.findFirst({
                    where: { projectId: id, invoiceNumber: `${invoiceBase}-PART2`, tenantId }
                });
                if (!existPart2) {
                    await this.prisma.projectPayment.create({
                        data: {
                            tenantId,
                            projectId: id,
                            invoiceNumber: `${invoiceBase}-PART2`,
                            amount: partAmount,
                            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            status: 'pending',
                            whatsappSent: false,
                        }
                    });
                }
            }
            if (completionPercentage >= 1.0) {
                const existPart3 = await this.prisma.projectPayment.findFirst({
                    where: { projectId: id, invoiceNumber: `${invoiceBase}-PART3`, tenantId }
                });
                if (!existPart3) {
                    const finalAmount = parseFloat((projectPrice - (3 * partAmount)).toFixed(2));
                    await this.prisma.projectPayment.create({
                        data: {
                            tenantId,
                            projectId: id,
                            invoiceNumber: `${invoiceBase}-PART3`,
                            amount: finalAmount,
                            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            status: 'pending',
                            whatsappSent: false,
                        }
                    });
                }
            }
        }
        const updatedProject = await this.prisma.project.update({
            where: { id, tenantId },
            data: {
                clientId,
                clientName: data.clientName !== undefined ? data.clientName : undefined,
                name: data.name,
                category: data.category,
                description: data.description,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                status: data.status || 'active',
                whatsappNumber: data.whatsappNumber,
                price: data.price !== undefined ? parseFloat(data.price) : undefined,
                modules: data.modules,
                platforms: data.platforms,
                deliveryCode: data.deliveryCode !== undefined ? !!data.deliveryCode : undefined,
                deliveryDocs: data.deliveryDocs !== undefined ? !!data.deliveryDocs : undefined,
                deliveryDb: data.deliveryDb !== undefined ? !!data.deliveryDb : undefined,
                deliveryQa: data.deliveryQa !== undefined ? !!data.deliveryQa : undefined,
                deliveryPayment: data.deliveryPayment !== undefined ? !!data.deliveryPayment : undefined,
                postCount: data.postCount !== undefined ? parseInt(data.postCount, 10) : undefined,
                videoCount: data.videoCount !== undefined ? parseInt(data.videoCount, 10) : undefined,
                socialCredentials: data.socialCredentials !== undefined ? data.socialCredentials : undefined,
                moduleDetails: data.moduleDetails !== undefined ? data.moduleDetails : undefined,
                projectInclusions: data.projectInclusions !== undefined ? data.projectInclusions : undefined,
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
                let finalClientName = updatedProject.clientName;
                if ((!finalClientName || finalClientName.trim() === '') && clientId) {
                    const clientUser = await this.prisma.user.findUnique({ where: { id: clientId } });
                    if (clientUser) {
                        finalClientName = clientUser.username;
                    }
                }
                if (!finalClientName || finalClientName.trim() === '') {
                    finalClientName = 'Valued Client';
                }
                await this.documentService.generateDocument(docName, tenantId, {
                    projectName: updatedProject.name,
                    clientName: finalClientName,
                    companyName: 'HIG AI Automation LLP',
                    startDate: updatedProject.startDate ? new Date(updatedProject.startDate).toLocaleDateString() : '____________',
                    endDate: updatedProject.endDate ? new Date(updatedProject.endDate).toLocaleDateString() : '____________',
                    price: updatedProject.price ? `₹${updatedProject.price.toLocaleString('en-IN')}` : '₹6,000.00',
                    postCount: updatedProject.postCount || 15,
                    videoCount: updatedProject.videoCount || 6,
                    isWebProject: updatedProject.category === 'Web/App Development',
                    isDigitalMarketing: updatedProject.category === 'Digital Marketing',
                    isAutomation: updatedProject.category === 'Automation',
                    isAiDevelopment: updatedProject.category === 'AI Development',
                    moduleDetails: updatedProject.moduleDetails || [],
                    projectInclusions: updatedProject.projectInclusions || '',
                    inclusions: updatedProject.projectInclusions ? updatedProject.projectInclusions.split(/[,\n]+/).map((x) => x.trim()).filter(Boolean) : [],
                }, 'PROJECT', updatedProject.id);
            }
            catch (error) {
                console.error(`Failed to auto-generate project doc ${docName} on update: ${error.message}`);
            }
        }
        return updatedProject;
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