import { PaymentService } from './payment.service';
export declare class PaymentController {
    private paymentService;
    constructor(paymentService: PaymentService);
    getAllPayments(req: any): Promise<({
        project: {
            name: string;
            whatsappNumber: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        invoiceNumber: string;
        amount: number;
        dueDate: Date;
        whatsappSent: boolean;
        updatedBy: string | null;
        projectId: string;
    })[]>;
    generateBill(body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        invoiceNumber: string;
        amount: number;
        dueDate: Date;
        whatsappSent: boolean;
        updatedBy: string | null;
        projectId: string;
    }>;
    markAsPaid(id: string, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        invoiceNumber: string;
        amount: number;
        dueDate: Date;
        whatsappSent: boolean;
        updatedBy: string | null;
        projectId: string;
    }>;
}
