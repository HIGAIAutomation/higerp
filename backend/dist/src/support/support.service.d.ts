import { PrismaService } from '../prisma/prisma.service';
export declare class SupportService {
    private prisma;
    constructor(prisma: PrismaService);
    createTicket(tenantId: string, userId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        assignedTo: string | null;
        updatedAt: Date;
        description: string;
        title: string;
        priority: string;
        userId: string | null;
        aiSummary: string | null;
    }>;
    generateAISummary(ticketId: string, description: string): Promise<void>;
    getTickets(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        assignedTo: string | null;
        updatedAt: Date;
        description: string;
        title: string;
        priority: string;
        userId: string | null;
        aiSummary: string | null;
    }[]>;
}
