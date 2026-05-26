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
exports.MarketingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MarketingService = class MarketingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPosts(tenantId, projectId, month) {
        return this.prisma.marketingPost.findMany({
            where: {
                tenantId,
                projectId,
                month: month || null,
            },
            orderBy: { platform: 'asc' },
        });
    }
    async upsertPost(tenantId, projectId, data, username) {
        const { platform, postType, status, comments, month, assignedTo, dueDate } = data;
        const existing = await this.prisma.marketingPost.findFirst({
            where: {
                tenantId,
                projectId,
                platform,
                postType,
                month: month || null,
            },
        });
        let result;
        if (existing) {
            result = await this.prisma.marketingPost.update({
                where: { id: existing.id },
                data: {
                    status: status !== undefined ? status : existing.status,
                    comments: comments !== undefined ? comments : existing.comments,
                    assignedTo: assignedTo !== undefined ? assignedTo : existing.assignedTo,
                    dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existing.dueDate,
                    updatedBy: username,
                },
            });
        }
        else {
            result = await this.prisma.marketingPost.create({
                data: {
                    tenantId,
                    projectId,
                    platform,
                    postType,
                    status: status || 'inprogress',
                    comments: comments || '',
                    month: month || null,
                    assignedTo: assignedTo || null,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    updatedBy: username,
                },
            });
        }
        await this.prisma.marketingPostHistory.create({
            data: {
                tenantId,
                projectId,
                platform: result.platform,
                postType: result.postType,
                status: result.status,
                comments: result.comments,
                month: result.month,
                assignedTo: result.assignedTo,
                dueDate: result.dueDate,
                updatedBy: username,
            },
        });
        if (status === 'posted' || status === 'completed') {
            result = await this.prisma.marketingPost.update({
                where: { id: result.id },
                data: {
                    status: 'inprogress',
                    comments: '',
                },
            });
        }
        return result;
    }
    async getPostHistory(tenantId, projectId, month) {
        const where = { tenantId };
        if (projectId) {
            where.projectId = projectId;
        }
        if (month) {
            where.month = month;
        }
        return this.prisma.marketingPostHistory.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAllPostsByMonth(tenantId, month) {
        return this.prisma.marketingPost.findMany({
            where: {
                tenantId,
                month,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getTenantUsers(tenantId) {
        return this.prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            },
            orderBy: { username: 'asc' },
        });
    }
    async getCampaigns(tenantId, projectId) {
        return this.prisma.adCampaign.findMany({
            where: { tenantId, projectId },
            orderBy: { startDate: 'desc' },
        });
    }
    async createCampaign(tenantId, projectId, data, username) {
        return this.prisma.adCampaign.create({
            data: {
                tenantId,
                projectId,
                name: data.name,
                spend: data.spend,
                leads: data.leads,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                updatedBy: username,
            },
        });
    }
    async getSpecialDayPosters(tenantId, projectId, month) {
        return this.prisma.specialDayPoster.findMany({
            where: { tenantId, projectId, month },
        });
    }
    async upsertSpecialDayPoster(tenantId, projectId, data, username) {
        const { holidayName, month, scheduledDate, isPlannedOnFirstDay, status } = data;
        const existing = await this.prisma.specialDayPoster.findFirst({
            where: { tenantId, projectId, month, holidayName },
        });
        if (existing) {
            return this.prisma.specialDayPoster.update({
                where: { id: existing.id },
                data: {
                    isPlannedOnFirstDay: isPlannedOnFirstDay !== undefined ? isPlannedOnFirstDay : existing.isPlannedOnFirstDay,
                    status: status || existing.status,
                    updatedBy: username,
                },
            });
        }
        else {
            return this.prisma.specialDayPoster.create({
                data: {
                    tenantId,
                    projectId,
                    month,
                    holidayName,
                    scheduledDate: new Date(scheduledDate),
                    isPlannedOnFirstDay: !!isPlannedOnFirstDay,
                    status: status || 'pending',
                    updatedBy: username,
                },
            });
        }
    }
};
exports.MarketingService = MarketingService;
exports.MarketingService = MarketingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarketingService);
//# sourceMappingURL=marketing.service.js.map