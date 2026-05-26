import { CrmService } from './crm.service';
export declare class CrmController {
    private crmService;
    constructor(crmService: CrmService);
    createLead(body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        assignedTo: string | null;
        companyName: string | null;
        contact: string | null;
        source: string | null;
        valEstimate: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    getLeads(req: any): Promise<({
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
        assignedTo: string | null;
        companyName: string | null;
        contact: string | null;
        source: string | null;
        valEstimate: import("@prisma/client-runtime-utils").Decimal | null;
    })[]>;
    createPackage(body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        isActive: boolean;
    }>;
    getPackages(req: any): Promise<({
        tiers: {
            id: string;
            name: string;
            price: import("@prisma/client-runtime-utils").Decimal;
            features: import("@prisma/client/runtime/client").JsonValue | null;
            packageId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        isActive: boolean;
    })[]>;
    generateQuote(leadId: string, packageId: string, req: any): Promise<{
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
}
