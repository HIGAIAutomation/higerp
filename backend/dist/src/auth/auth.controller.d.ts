import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            role: any;
            tenantId: any;
            dob: any;
            address: any;
            designation: any;
            salary: any;
            pageAccess: any;
        };
    }>;
    register(body: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        email: string | null;
        username: string;
        role: string;
        dob: string | null;
        address: string | null;
        designation: string | null;
        salary: import("@prisma/client-runtime-utils").Decimal | null;
        pageAccess: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getProfile(req: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        email: string | null;
        username: string;
        role: string;
        dob: string | null;
        address: string | null;
        designation: string | null;
        salary: import("@prisma/client-runtime-utils").Decimal | null;
        pageAccess: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getAllUsers(req: any): Promise<{
        id: string;
        createdAt: Date;
        email: string | null;
        username: string;
        role: string;
        dob: string | null;
        address: string | null;
        designation: string | null;
        salary: import("@prisma/client-runtime-utils").Decimal | null;
        pageAccess: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
    updateUserAccess(req: any, userId: string, body: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        email: string | null;
        username: string;
        role: string;
        dob: string | null;
        address: string | null;
        designation: string | null;
        salary: import("@prisma/client-runtime-utils").Decimal | null;
        pageAccess: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
