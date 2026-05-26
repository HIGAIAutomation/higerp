import { SupportService } from './support.service';
export declare class SupportController {
    private supportService;
    constructor(supportService: SupportService);
    createTicket(body: any, req: any): Promise<{
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
    getTickets(req: any): Promise<{
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
