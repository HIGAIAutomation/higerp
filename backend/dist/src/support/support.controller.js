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
exports.SupportController = void 0;
const common_1 = require("@nestjs/common");
const support_service_1 = require("./support.service");
const passport_1 = require("@nestjs/passport");
let SupportController = class SupportController {
    supportService;
    constructor(supportService) {
        this.supportService = supportService;
    }
    async createTicket(body, req) {
        return this.supportService.createTicket(req.user.tenantId, req.user.userId, body);
    }
    async getTickets(req) {
        return this.supportService.getTickets(req.user.tenantId);
    }
};
exports.SupportController = SupportController;
__decorate([
    (0, common_1.Post)('tickets'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Get)('tickets'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SupportController.prototype, "getTickets", null);
exports.SupportController = SupportController = __decorate([
    (0, common_1.Controller)('support'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [support_service_1.SupportService])
], SupportController);
//# sourceMappingURL=support.controller.js.map