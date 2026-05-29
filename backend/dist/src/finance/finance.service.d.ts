import { PrismaService } from '../prisma/prisma.service';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    createInvoice(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        dueDate: Date | null;
        clientId: string;
        invoiceNumber: string;
        subtotal: number;
        cgst: number;
        sgst: number;
        igst: number;
        total: number;
    }>;
    createExpense(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        category: string;
        description: string | null;
        amount: number;
        date: Date;
    }>;
    getFinancialSummary(tenantId: string): Promise<{
        revenue: number;
        expenses: number;
        netProfit: number;
    }>;
}
