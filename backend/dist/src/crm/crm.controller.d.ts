import { CrmService } from './crm.service';
export declare class CrmController {
    private crmService;
    constructor(crmService: CrmService);
    createLead(body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        companyName: string | null;
        contact: string | null;
        source: string | null;
        assignedTo: string | null;
        valEstimate: number | null;
        uniqueId: string | null;
        interestedService: string | null;
        requirements: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getLeads(req: any): Promise<({
        opportunities: {
            id: string;
            tenantId: string;
            leadId: string;
            stage: string;
            expectedCloseDate: Date | null;
        }[];
        followUps: {
            id: string;
            tenantId: string;
            leadId: string;
            dateTime: Date;
            endDateTime: Date | null;
            notes: string | null;
            synced: boolean;
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
        uniqueId: string | null;
        interestedService: string | null;
        requirements: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    updateLead(id: string, body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        companyName: string | null;
        contact: string | null;
        source: string | null;
        assignedTo: string | null;
        valEstimate: number | null;
        uniqueId: string | null;
        interestedService: string | null;
        requirements: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    deleteLead(id: string, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        companyName: string | null;
        contact: string | null;
        source: string | null;
        assignedTo: string | null;
        valEstimate: number | null;
        uniqueId: string | null;
        interestedService: string | null;
        requirements: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    createFollowUp(body: any, req: any): Promise<({
        lead: {
            id: string;
            tenantId: string;
            status: string;
            companyName: string | null;
            contact: string | null;
            source: string | null;
            assignedTo: string | null;
            valEstimate: number | null;
            uniqueId: string | null;
            interestedService: string | null;
            requirements: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        tenantId: string;
        leadId: string;
        dateTime: Date;
        endDateTime: Date | null;
        notes: string | null;
        synced: boolean;
    }) | null>;
    getFollowUps(req: any): Promise<({
        lead: {
            id: string;
            tenantId: string;
            status: string;
            companyName: string | null;
            contact: string | null;
            source: string | null;
            assignedTo: string | null;
            valEstimate: number | null;
            uniqueId: string | null;
            interestedService: string | null;
            requirements: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        tenantId: string;
        leadId: string;
        dateTime: Date;
        endDateTime: Date | null;
        notes: string | null;
        synced: boolean;
    })[]>;
    deleteFollowUp(id: string, req: any): Promise<{
        id: string;
        tenantId: string;
        leadId: string;
        dateTime: Date;
        endDateTime: Date | null;
        notes: string | null;
        synced: boolean;
    }>;
    createPackage(body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        basePrice: number;
        isActive: boolean;
    }>;
    getPackages(req: any): Promise<({
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
    updatePackage(id: string, body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        basePrice: number;
        isActive: boolean;
    }>;
    deletePackage(id: string, req: any): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        basePrice: number;
        isActive: boolean;
    }>;
    generateQuote(leadId: string, packageId: string, req: any): Promise<{
        id: string;
        tenantId: string;
        templateId: string | null;
        entityType: string;
        entityId: string;
        filePath: string | null;
        compiledHtml: string | null;
        status: string;
        signatureData: string | null;
        signedAt: Date | null;
        createdAt: Date;
    }>;
}
