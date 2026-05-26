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
        invoiceNumber: string;
        clientId: string;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        cgst: import("@prisma/client-runtime-utils").Decimal;
        sgst: import("@prisma/client-runtime-utils").Decimal;
        igst: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
    }>;
    createExpense(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        category: string;
        description: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        date: Date;
    }>;
    getFinancialSummary(tenantId: string): Promise<{
        revenue: number;
        expenses: number;
        netProfit: number;
    }>;
}
