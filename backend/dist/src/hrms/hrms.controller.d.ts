import { HrmsService } from './hrms.service';
export declare class HrmsController {
    private hrmsService;
    constructor(hrmsService: HrmsService);
    createEmployee(body: any, req: any): Promise<{
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
    getEmployees(req: any): Promise<{
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
