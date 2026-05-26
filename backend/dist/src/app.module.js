"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const tenant_module_1 = require("./tenant/tenant.module");
const hrms_module_1 = require("./hrms/hrms.module");
const document_module_1 = require("./document/document.module");
const project_module_1 = require("./project/project.module");
const crm_module_1 = require("./crm/crm.module");
const finance_module_1 = require("./finance/finance.module");
const support_module_1 = require("./support/support.module");
const asset_module_1 = require("./asset/asset.module");
const knowledge_module_1 = require("./knowledge/knowledge.module");
const marketing_module_1 = require("./project/marketing.module");
const payment_module_1 = require("./project/payment.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            prisma_module_1.PrismaModule,
            tenant_module_1.TenantModule,
            hrms_module_1.HrmsModule,
            document_module_1.DocumentModule,
            project_module_1.ProjectModule,
            crm_module_1.CrmModule,
            finance_module_1.FinanceModule,
            support_module_1.SupportModule,
            asset_module_1.AssetModule,
            knowledge_module_1.KnowledgeModule,
            marketing_module_1.MarketingModule,
            payment_module_1.PaymentModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map