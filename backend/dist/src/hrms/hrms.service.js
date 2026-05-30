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
                profDocNumber: data.profDocNumber || null,
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
                include: { template: true },
            });
            return { ...emp, documents };
        }));
    }
    async closeEmployee(tenantId, employeeId, data) {
        const employee = await this.prisma.employee.update({
            where: { id: employeeId, tenantId },
            data: { status: 'inactive' },
        });
        const relievingDate = data.relievingDate
            ? new Date(data.relievingDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
        const doc = await this.documentService.generateDocument('Closing Agreement', tenantId, {
            ...employee,
            companyName: 'HIG AI Automation LLP',
            joiningDate: employee.joiningDate
                ? employee.joiningDate.toISOString().split('T')[0]
                : 'N/A',
            relievingDate,
            reason: data.reason || 'Resignation',
        }, 'EMPLOYEE', employee.id);
        return { employee, document: doc };
    }
    async generatePayslip(tenantId, employeeId, month, data) {
        const employee = await this.prisma.employee.findFirst({
            where: { id: employeeId, tenantId },
        });
        if (!employee) {
            throw new Error('Employee not found');
        }
        const basicSalary = Number(employee.salaryBasis || 0);
        const bonus = Number(data?.bonus || 0);
        const incentive = Number(data?.incentive || 0);
        const pf = Number(data?.pf || 0);
        const esi = Number(data?.esi || 0);
        const otherDeductions = Number(data?.otherDeductions || 0);
        const grossEarnings = basicSalary + bonus + incentive;
        const totalDeductions = pf + esi + otherDeductions;
        const netSalary = grossEarnings - totalDeductions;
        const doc = await this.documentService.generateDocument('Employee Payslip', tenantId, {
            ...employee,
            companyName: 'HIG AI Automation LLP',
            month,
            basicSalary: basicSalary.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            bonus: bonus.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            incentive: incentive.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            pf: pf.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            esi: esi.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            otherDeductions: otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            grossEarnings: grossEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            totalDeductions: totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 }),
            netSalary: netSalary.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        }, 'EMPLOYEE', employee.id);
        return doc;
    }
};
exports.HrmsService = HrmsService;
exports.HrmsService = HrmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_service_1.DocumentService])
], HrmsService);
//# sourceMappingURL=hrms.service.js.map