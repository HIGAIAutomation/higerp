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
exports.HrmsController = void 0;
const common_1 = require("@nestjs/common");
const hrms_service_1 = require("./hrms.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let HrmsController = class HrmsController {
    hrmsService;
    constructor(hrmsService) {
        this.hrmsService = hrmsService;
    }
    async createEmployee(body, req) {
        return this.hrmsService.createEmployee(req.user.tenantId, body);
    }
    async getEmployees(req) {
        return this.hrmsService.getEmployees(req.user.tenantId);
    }
};
exports.HrmsController = HrmsController;
__decorate([
    (0, common_1.Post)('employees'),
    (0, roles_decorator_1.Roles)('admin', 'hr'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "createEmployee", null);
__decorate([
    (0, common_1.Get)('employees'),
    (0, roles_decorator_1.Roles)('admin', 'hr', 'user'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "getEmployees", null);
exports.HrmsController = HrmsController = __decorate([
    (0, common_1.Controller)('hrms'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [hrms_service_1.HrmsService])
], HrmsController);
//# sourceMappingURL=hrms.controller.js.map