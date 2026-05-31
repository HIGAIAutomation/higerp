import { HrmsService } from './hrms.service';
export declare class HrmsController {
    private hrmsService;
    constructor(hrmsService: HrmsService);
    createEmployee(body: any, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        firstName: string;
        lastName: string;
        email: string;
        designation: string | null;
        salaryBasis: number | null;
        joiningDate: Date | null;
        profDocNumber: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        deptId: string | null;
    }>;
    getEmployees(req: any): Promise<any[]>;
    closeEmployee(id: string, body: any, req: any): Promise<{
        employee: {
            id: string;
            tenantId: string;
            status: string;
            createdAt: Date;
            firstName: string;
            lastName: string;
            email: string;
            designation: string | null;
            salaryBasis: number | null;
            joiningDate: Date | null;
            profDocNumber: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            deptId: string | null;
        };
        document: {
            id: string;
            tenantId: string;
            templateId: string | null;
            entityType: string;
            entityId: string;
            filePath: string | null;
            compiledHtml: string | null;
            status: string;
            createdAt: Date;
        };
    }>;
    generatePayslip(id: string, body: any, req: any): Promise<{
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
