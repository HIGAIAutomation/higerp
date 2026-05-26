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
exports.HrmsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const document_service_1 = require("../document/document.service");
let HrmsService = class HrmsService {
    prisma;
    documentService;
    constructor(prisma, documentService) {
        this.prisma = prisma;
        this.documentService = documentService;
    }
    async createEmployee(tenantId, data) {
        const employee = await this.prisma.employee.create({
            data: {
                tenantId,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                designation: data.designation,
                salaryBasis: data.salaryBasis,
                joiningDate: new Date(data.joiningDate),
                status: 'active',
            },
        });
        const docsToGenerate = [
            'Offer Letter',
            'Employment Agreement',
            'NDA (Employee)',
            'IP Assignment Agreement (IPAA)',
        ];
        for (const docName of docsToGenerate) {
            try {
                await this.documentService.generateDocument(docName, tenantId, { ...employee, companyName: 'HIG AI Automation LLP' }, 'EMPLOYEE', employee.id);
            }
            catch (error) {
                console.error(`Failed to auto-generate ${docName}: ${error.message}`);
            }
        }
        return employee;
    }
    async getEmployees(tenantId) {
        const employees = await this.prisma.employee.findMany({
            where: { tenantId },
        });
        return Promise.all(employees.map(async (emp) => {
            const documents = await this.prisma.generatedDocument.findMany({
                where: { tenantId, entityId: emp.id, entityType: 'EMPLOYEE' },
            });
            return { ...emp, documents };
        }));
    }
};
exports.HrmsService = HrmsService;
exports.HrmsService = HrmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_service_1.DocumentService])
], HrmsService);
//# sourceMappingURL=hrms.service.js.map