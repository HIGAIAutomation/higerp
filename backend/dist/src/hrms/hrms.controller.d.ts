import { HrmsService } from './hrms.service';
export declare class HrmsController {
    private hrmsService;
    constructor(hrmsService: HrmsService);
    createEmployee(body: any, req: any): Promise<{
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
    getEmployees(req: any): Promise<any[]>;
    closeEmployee(id: string, body: any, req: any): Promise<{
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
    generatePayslip(id: string, body: any, req: any): Promise<{
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
