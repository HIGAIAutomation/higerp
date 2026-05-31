import { ProjectService } from './project.service';
export declare class ProjectController {
    private projectService;
    constructor(projectService: ProjectService);
    createProject(body: any, req: any): Promise<any>;
    getProjects(req: any): Promise<({
        adCampaigns: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            leads: number;
            startDate: Date;
            endDate: Date | null;
            updatedBy: string;
            projectId: string;
            spend: number;
        }[];
        client: {
            id: string;
            email: string | null;
            username: string;
            role: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        status: string;
        name: string;
        category: string;
        description: string | null;
        price: number;
        clientId: string | null;
        clientName: string | null;
        startDate: Date | null;
        endDate: Date | null;
        whatsappNumber: string | null;
        modules: string | null;
        platforms: string | null;
        deliveryCode: boolean;
        deliveryDocs: boolean;
        deliveryDb: boolean;
        deliveryQa: boolean;
        deliveryPayment: boolean;
        postCount: number;
        videoCount: number;
        socialCredentials: import("@prisma/client/runtime/library").JsonValue | null;
        moduleDetails: import("@prisma/client/runtime/library").JsonValue | null;
        projectInclusions: string | null;
    })[]>;
    updateProject(id: string, body: any, req: any): Promise<any>;
    deleteProject(id: string, req: any): Promise<{
        id: string;
        tenantId: string;
        status: string;
        name: string;
        category: string;
        description: string | null;
        price: number;
        clientId: string | null;
        clientName: string | null;
        startDate: Date | null;
        endDate: Date | null;
        whatsappNumber: string | null;
        modules: string | null;
        platforms: string | null;
        deliveryCode: boolean;
        deliveryDocs: boolean;
        deliveryDb: boolean;
        deliveryQa: boolean;
        deliveryPayment: boolean;
        postCount: number;
        videoCount: number;
        socialCredentials: import("@prisma/client/runtime/library").JsonValue | null;
        moduleDetails: import("@prisma/client/runtime/library").JsonValue | null;
        projectInclusions: string | null;
    }>;
}
