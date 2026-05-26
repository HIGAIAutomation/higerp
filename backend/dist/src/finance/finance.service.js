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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FinanceService = class FinanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createInvoice(tenantId, data) {
        const subtotal = data.subtotal;
        let cgst = 0, sgst = 0, igst = 0;
        if (data.isInterState) {
            igst = subtotal * 0.18;
        }
        else {
            cgst = subtotal * 0.09;
            sgst = subtotal * 0.09;
        }
        const total = Number(subtotal) + Number(cgst) + Number(sgst) + Number(igst);
        const invoice = await this.prisma.invoice.create({
            data: {
                tenantId,
                invoiceNumber: data.invoiceNumber,
                clientId: data.clientId,
                subtotal,
                cgst,
                sgst,
                igst,
                total,
                status: 'unpaid',
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
            },
        });
        await this.prisma.transaction.create({
            data: {
                tenantId,
                type: 'CREDIT',
                amount: total,
                description: `Invoice ${invoice.invoiceNumber} generated`,
            },
        });
        return invoice;
    }
    async createExpense(tenantId, data) {
        const expense = await this.prisma.expense.create({
            data: {
                tenantId,
                category: data.category,
                amount: data.amount,
                description: data.description,
                status: 'approved',
            },
        });
        await this.prisma.transaction.create({
            data: {
                tenantId,
                type: 'DEBIT',
                amount: data.amount,
                description: `Expense: ${data.category} - ${data.description}`,
            },
        });
        return expense;
    }
    async getFinancialSummary(tenantId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { tenantId },
        });
        const totalRevenue = transactions
            .filter((t) => t.type === 'CREDIT')
            .reduce((acc, t) => acc + Number(t.amount), 0);
        const totalExpenses = transactions
            .filter((t) => t.type === 'DEBIT')
            .reduce((acc, t) => acc + Number(t.amount), 0);
        return {
            revenue: totalRevenue,
            expenses: totalExpenses,
            netProfit: totalRevenue - totalExpenses,
        };
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map