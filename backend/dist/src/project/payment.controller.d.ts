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
        projectId: string;
        updatedBy: string | null;
        invoiceNumber: string;
        dueDate: Date;
        amount: number;
        whatsappSent: boolean;
    })[]>;
    generateBill(body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        updatedBy: string | null;
        invoiceNumber: string;
        dueDate: Date;
        amount: number;
        whatsappSent: boolean;
    }>;
    markAsPaid(id: string, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
        updatedBy: string | null;
        invoiceNumber: string;
        dueDate: Date;
        amount: number;
        whatsappSent: boolean;
    }>;
}
