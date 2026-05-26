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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let PaymentController = class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async getAllPayments(req) {
        return this.paymentService.getAllPayments(req.user.tenantId);
    }
    async generateBill(body, req) {
        return this.paymentService.generateBill(req.user.tenantId, body);
    }
    async markAsPaid(id, req) {
        return this.paymentService.markAsPaid(req.user.tenantId, id, req.user.username);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('superadmin'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getAllPayments", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('superadmin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "generateBill", null);
__decorate([
    (0, common_1.Put)(':id/pay'),
    (0, roles_decorator_1.Roles)('superadmin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "markAsPaid", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('project-payments'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map