import { FinanceService } from './finance.service';
export declare class FinanceController {
    private financeService;
    constructor(financeService: FinanceService);
    createInvoice(body: any, req: any): Promise<{
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
    createExpense(body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        category: string;
        description: string | null;
        amount: import("@prisma/client-runtime-utils").Decimal;
        date: Date;
    }>;
    getSummary(req: any): Promise<{
        revenue: number;
        expenses: number;
        netProfit: number;
    }>;
}
