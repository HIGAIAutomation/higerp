import { PaymentService } from './payment.service';
export declare class PaymentController {
    private paymentService;
    constructor(paymentService: PaymentService);
    getAllPayments(req: any): Promise<({
        project: {
            name: string;
        };
    } & {
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        projectId: string;
        dueDate: Date;
        updatedBy: string | null;
        updatedAt: Date;
        invoiceNumber: string;
        amount: number;
        whatsappSent: boolean;
    })[]>;
    generateBill(body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        projectId: string;
        dueDate: Date;
        updatedBy: string | null;
        updatedAt: Date;
        invoiceNumber: string;
        amount: number;
        whatsappSent: boolean;
    }>;
    markAsPaid(id: string, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        projectId: string;
        dueDate: Date;
        updatedBy: string | null;
        updatedAt: Date;
        invoiceNumber: string;
        amount: number;
        whatsappSent: boolean;
    }>;
}
