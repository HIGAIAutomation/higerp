import { PrismaService } from '../prisma/prisma.service';
export declare class DocumentService {
    private prisma;
    constructor(prisma: PrismaService);
    generateDocument(templateName: string, tenantId: string, data: any, entityType: string, entityId: string): Promise<{
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
    getDocument(tenantId: string, id: string): Promise<({
        template: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            category: string;
            contentHtml: string;
        } | null;
    } & {
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
    }) | null>;
    generatePdf(tenantId: string, id: string): Promise<Buffer>;
    getDocumentsForEntity(tenantId: string, entityId: string, entityType: string): Promise<({
        template: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            category: string;
            contentHtml: string;
        } | null;
    } & {
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
    })[]>;
    createTemplate(tenantId: string, name: string, category: string, contentHtml: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        category: string;
        contentHtml: string;
    }>;
    signDocument(tenantId: string, id: string, signatureData: string): Promise<({
        template: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            category: string;
            contentHtml: string;
        } | null;
    } & {
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
    }) | null>;
    unsignDocument(tenantId: string, id: string): Promise<({
        template: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            category: string;
            contentHtml: string;
        } | null;
    } & {
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
    }) | null>;
}
