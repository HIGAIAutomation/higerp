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
exports.CrmController = void 0;
const common_1 = require("@nestjs/common");
const crm_service_1 = require("./crm.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let CrmController = class CrmController {
    crmService;
    constructor(crmService) {
        this.crmService = crmService;
    }
    async createLead(body, req) {
        return this.crmService.createLead(req.user.tenantId, body);
    }
    async getLeads(req) {
        return this.crmService.getLeads(req.user.tenantId);
    }
    async updateLead(id, body, req) {
        return this.crmService.updateLead(req.user.tenantId, id, body);
    }
    async deleteLead(id, req) {
        return this.crmService.deleteLead(req.user.tenantId, id);
    }
    async createFollowUp(body, req) {
        return this.crmService.createFollowUp(req.user.tenantId, body);
    }
    async getFollowUps(req) {
        return this.crmService.getFollowUps(req.user.tenantId);
    }
    async deleteFollowUp(id, req) {
        return this.crmService.deleteFollowUp(req.user.tenantId, id);
    }
    async createPackage(body, req) {
        return this.crmService.createPackage(req.user.tenantId, body);
    }
    async getPackages(req) {
        return this.crmService.getPackages(req.user.tenantId);
    }
    async updatePackage(id, body, req) {
        return this.crmService.updatePackage(req.user.tenantId, id, body);
    }
    async deletePackage(id, req) {
        return this.crmService.deletePackage(req.user.tenantId, id);
    }
    async generateQuote(leadId, packageId, req) {
        return this.crmService.generateQuote(req.user.tenantId, leadId, packageId);
    }
};
exports.CrmController = CrmController;
__decorate([
    (0, common_1.Post)('leads'),
    (0, roles_decorator_1.Roles)('admin', 'sales'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "createLead", null);
__decorate([
    (0, common_1.Get)('leads'),
    (0, roles_decorator_1.Roles)('admin', 'sales'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getLeads", null);
__decorate([
    (0, common_1.Put)('leads/:id'),
    (0, roles_decorator_1.Roles)('admin', 'sales'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "updateLead", null);
__decorate([
    (0, common_1.Delete)('leads/:id'),
    (0, roles_decorator_1.Roles)('admin', 'sales'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "deleteLead", null);
__decorate([
    (0, common_1.Post)('followups'),
    (0, roles_decorator_1.Roles)('admin', 'sales'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "createFollowUp", null);
__decorate([
    (0, common_1.Get)('followups'),
    (0, roles_decorator_1.Roles)('admin', 'sales'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getFollowUps", null);
__decorate([
    (0, common_1.Delete)('followups/:id'),
    (0, roles_decorator_1.Roles)('admin', 'sales'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "deleteFollowUp", null);
__decorate([
    (0, common_1.Post)('packages'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "createPackage", null);
__decorate([
    (0, common_1.Get)('packages'),
    (0, roles_decorator_1.Roles)('admin', 'sales', 'user'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "getPackages", null);
__decorate([
    (0, common_1.Put)('packages/:id'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "updatePackage", null);
__decorate([
    (0, common_1.Delete)('packages/:id'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "deletePackage", null);
__decorate([
    (0, common_1.Post)('leads/:id/quote'),
    (0, roles_decorator_1.Roles)('admin', 'sales'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('packageId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CrmController.prototype, "generateQuote", null);
exports.CrmController = CrmController = __decorate([
    (0, common_1.Controller)('crm'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [crm_service_1.CrmService])
], CrmController);
//# sourceMappingURL=crm.controller.js.map