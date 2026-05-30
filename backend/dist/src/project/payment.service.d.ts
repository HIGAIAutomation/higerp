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
        projectId: string;
        updatedBy: string | null;
        invoiceNumber: string;
        dueDate: Date;
        amount: number;
        whatsappSent: boolean;
    })[]>;
    generateBill(tenantId: string, data: any): Promise<{
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
    markAsPaid(tenantId: string, id: string, username: string): Promise<{
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
