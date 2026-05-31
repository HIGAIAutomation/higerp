import { DocumentService } from './document.service';
export declare class DocumentController {
    private documentService;
    constructor(documentService: DocumentService);
    getDocumentsForEntity(entityType: string, entityId: string, req: any): Promise<({
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
    downloadDocument(id: string, req: any, res: any): Promise<void>;
    downloadPdf(id: string, req: any, res: any): Promise<void>;
    renderPdf(body: {
        htmlContent: string;
        filename?: string;
    }, res: any): Promise<void>;
    getDocument(id: string, req: any): Promise<({
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
    signDocument(id: string, body: {
        signatureData: string;
    }, req: any): Promise<({
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
    unsignDocument(id: string, req: any): Promise<({
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
