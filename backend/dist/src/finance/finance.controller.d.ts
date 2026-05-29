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
        clientId: string;
        invoiceNumber: string;
        subtotal: number;
        cgst: number;
        sgst: number;
        igst: number;
        total: number;
    }>;
    createExpense(body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        category: string;
        description: string | null;
        amount: number;
        date: Date;
    }>;
    getSummary(req: any): Promise<{
        revenue: number;
        expenses: number;
        netProfit: number;
    }>;
}
