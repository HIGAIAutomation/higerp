import { PrismaService } from '../prisma/prisma.service';
import { DocumentService } from '../document/document.service';
export declare class HrmsService {
    private prisma;
    private documentService;
    constructor(prisma: PrismaService, documentService: DocumentService);
    private ensureTemplates;
    createEmployee(tenantId: string, data: any): Promise<{
        documents: any[];
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        designation: string | null;
        salaryBasis: number | null;
        joiningDate: Date | null;
        profDocNumber: string | null;
        status: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        tenantId: string;
        deptId: string | null;
    }>;
    getEmployees(tenantId: string): Promise<any[]>;
    closeEmployee(tenantId: string, employeeId: string, data: any): Promise<{
        employee: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            designation: string | null;
            salaryBasis: number | null;
            joiningDate: Date | null;
            profDocNumber: string | null;
            status: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            tenantId: string;
            deptId: string | null;
        };
        document: {
            id: string;
            status: string;
            createdAt: Date;
            tenantId: string;
            templateId: string | null;
            entityType: string;
            entityId: string;
            filePath: string | null;
            compiledHtml: string | null;
        };
    }>;
    generatePayslip(tenantId: string, employeeId: string, month: string, data?: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        tenantId: string;
        templateId: string | null;
        entityType: string;
        entityId: string;
        filePath: string | null;
        compiledHtml: string | null;
    }>;
}
