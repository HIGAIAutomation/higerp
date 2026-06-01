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
        uniqueId: string | null;
        interestedService: string | null;
        requirements: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
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
        signatureData: string | null;
        signedAt: Date | null;
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
    updateLead(tenantId: string, id: string, data: any): Promise<{
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
    deleteLead(tenantId: string, id: string): Promise<{
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
    updatePackage(tenantId: string, id: string, data: any): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        basePrice: number;
        isActive: boolean;
    }>;
    deletePackage(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        basePrice: number;
        isActive: boolean;
    }>;
    generateClientRequirementDocument(tenantId: string, leadId: string): Promise<{
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
    } | undefined>;
    sendGoogleCalendarInvite(followUp: any): Promise<void>;
    createFollowUp(tenantId: string, data: any): Promise<({
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
    getFollowUps(tenantId: string): Promise<({
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
    deleteFollowUp(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        leadId: string;
        dateTime: Date;
        endDateTime: Date | null;
        notes: string | null;
        synced: boolean;
    }>;
}
