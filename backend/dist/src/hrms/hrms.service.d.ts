import { PrismaService } from '../prisma/prisma.service';
import { DocumentService } from '../document/document.service';
export declare class HrmsService {
    private prisma;
    private documentService;
    constructor(prisma: PrismaService, documentService: DocumentService);
    createEmployee(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        email: string;
        designation: string | null;
        firstName: string;
        lastName: string;
        salaryBasis: number | null;
        joiningDate: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        deptId: string | null;
    }>;
    getEmployees(tenantId: string): Promise<{
        documents: {
            id: string;
            tenantId: string;
            templateId: string | null;
            entityType: string;
            entityId: string;
            filePath: string | null;
            compiledHtml: string | null;
            status: string;
            createdAt: Date;
        }[];
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        email: string;
        designation: string | null;
        firstName: string;
        lastName: string;
        salaryBasis: number | null;
        joiningDate: Date | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        deptId: string | null;
    }[]>;
}
