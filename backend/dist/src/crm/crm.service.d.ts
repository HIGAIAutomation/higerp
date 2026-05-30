import { PrismaService } from '../prisma/prisma.service';
import { DocumentService } from '../document/document.service';
export declare class CrmService {
    private prisma;
    private documentService;
    constructor(prisma: PrismaService, documentService: DocumentService);
    createLead(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        companyName: string | null;
        contact: string | null;
        source: string | null;
        assignedTo: string | null;
        valEstimate: number | null;
    }>;
    createPackage(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        basePrice: number;
        isActive: boolean;
    }>;
    generateQuote(tenantId: string, leadId: string, packageId: string): Promise<{
        id: string;
        tenantId: string;
        templateId: string | null;
        entityType: string;
        entityId: string;
        filePath: string | null;
        compiledHtml: string | null;
        status: string;
        createdAt: Date;
    }>;
    getLeads(tenantId: string): Promise<({
        opportunities: {
            id: string;
            tenantId: string;
            leadId: string;
            stage: string;
            expectedCloseDate: Date | null;
        }[];
    } & {
        id: string;
        tenantId: string;
        status: string;
        companyName: string | null;
        contact: string | null;
        source: string | null;
        assignedTo: string | null;
        valEstimate: number | null;
    })[]>;
    getPackages(tenantId: string): Promise<({
        tiers: {
            id: string;
            name: string;
            price: number;
            features: import("@prisma/client/runtime/library").JsonValue | null;
            packageId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        basePrice: number;
        isActive: boolean;
    })[]>;
}
