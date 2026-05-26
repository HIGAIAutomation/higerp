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
exports.MarketingController = void 0;
const common_1 = require("@nestjs/common");
const marketing_service_1 = require("./marketing.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let MarketingController = class MarketingController {
    marketingService;
    constructor(marketingService) {
        this.marketingService = marketingService;
    }
    async getAllPostsByMonth(month, req) {
        return this.marketingService.getAllPostsByMonth(req.user.tenantId, month);
    }
    async getAllPostHistory(month, req) {
        return this.marketingService.getPostHistory(req.user.tenantId, undefined, month);
    }
    async getTenantUsers(req) {
        return this.marketingService.getTenantUsers(req.user.tenantId);
    }
    async getPosts(projectId, month, req) {
        return this.marketingService.getPosts(req.user.tenantId, projectId, month);
    }
    async upsertPost(projectId, body, req) {
        return this.marketingService.upsertPost(req.user.tenantId, projectId, body, req.user.username);
    }
    async getPostHistory(projectId, month, req) {
        return this.marketingService.getPostHistory(req.user.tenantId, projectId, month);
    }
    async getCampaigns(projectId, req) {
        return this.marketingService.getCampaigns(req.user.tenantId, projectId);
    }
    async createCampaign(projectId, body, req) {
        return this.marketingService.createCampaign(req.user.tenantId, projectId, body, req.user.username);
    }
    async getSpecialDayPosters(projectId, month, req) {
        return this.marketingService.getSpecialDayPosters(req.user.tenantId, projectId, month);
    }
    async upsertSpecialDayPoster(projectId, body, req) {
        return this.marketingService.upsertSpecialDayPoster(req.user.tenantId, projectId, body, req.user.username);
    }
};
exports.MarketingController = MarketingController;
__decorate([
    (0, common_1.Get)('posts/all'),
    (0, roles_decorator_1.Roles)('admin', 'project_manager', 'user', 'superadmin'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "getAllPostsByMonth", null);
__decorate([
    (0, common_1.Get)('posts/history/all'),
    (0, roles_decorator_1.Roles)('admin', 'project_manager', 'user', 'superadmin'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "getAllPostHistory", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, roles_decorator_1.Roles)('admin', 'project_manager', 'user', 'superadmin'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "getTenantUsers", null);
__decorate([
    (0, common_1.Get)(':projectId/posts'),
    (0, roles_decorator_1.Roles)('admin', 'project_manager', 'user', 'superadmin'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "getPosts", null);
__decorate([
    (0, common_1.Post)(':projectId/posts'),
    (0, roles_decorator_1.Roles)('admin', 'project_manager', 'user', 'superadmin'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "upsertPost", null);
__decorate([
    (0, common_1.Get)(':projectId/posts/history'),
    (0, roles_decorator_1.Roles)('admin', 'project_manager', 'user', 'superadmin'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "getPostHistory", null);
__decorate([
    (0, common_1.Get)(':projectId/campaigns'),
    (0, roles_decorator_1.Roles)('admin', 'project_manager', 'user', 'superadmin'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "getCampaigns", null);
__decorate([
    (0, common_1.Post)(':projectId/campaigns'),
    (0, roles_decorator_1.Roles)('admin', 'project_manager', 'user', 'superadmin'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "createCampaign", null);
__decorate([
    (0, common_1.Get)(':projectId/special-days'),
    (0, roles_decorator_1.Roles)('admin', 'project_manager', 'user', 'superadmin'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "getSpecialDayPosters", null);
__decorate([
    (0, common_1.Post)(':projectId/special-days'),
    (0, roles_decorator_1.Roles)('admin', 'project_manager', 'user', 'superadmin'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MarketingController.prototype, "upsertSpecialDayPoster", null);
exports.MarketingController = MarketingController = __decorate([
    (0, common_1.Controller)('marketing'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [marketing_service_1.MarketingService])
], MarketingController);
//# sourceMappingURL=marketing.controller.js.map