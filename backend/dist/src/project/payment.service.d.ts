import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllPayments(tenantId: string): Promise<({
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
        dueDate: Date;
        amount: number;
        projectId: string;
        updatedBy: string | null;
        whatsappSent: boolean;
    })[]>;
    generateBill(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        invoiceNumber: string;
        dueDate: Date;
        amount: number;
        projectId: string;
        updatedBy: string | null;
        whatsappSent: boolean;
    }>;
    markAsPaid(tenantId: string, id: string, username: string): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        invoiceNumber: string;
        dueDate: Date;
        amount: number;
        projectId: string;
        updatedBy: string | null;
        whatsappSent: boolean;
    }>;
}
