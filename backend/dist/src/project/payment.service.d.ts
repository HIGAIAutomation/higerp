import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllPayments(tenantId: string): Promise<({
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
        amount: import("@prisma/client-runtime-utils").Decimal;
        whatsappSent: boolean;
    })[]>;
    generateBill(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        projectId: string;
        dueDate: Date;
        updatedBy: string | null;
        updatedAt: Date;
        invoiceNumber: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        whatsappSent: boolean;
    }>;
    markAsPaid(tenantId: string, id: string, username: string): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        projectId: string;
        dueDate: Date;
        updatedBy: string | null;
        updatedAt: Date;
        invoiceNumber: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        whatsappSent: boolean;
    }>;
}
