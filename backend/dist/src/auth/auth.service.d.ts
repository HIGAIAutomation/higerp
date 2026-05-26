import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(username: string, pass: string, tenantId?: string): Promise<any>;
    login(user: any): Promise<{
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
    register(data: any): Promise<{
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
    getAllUsers(tenantId: string): Promise<{
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
    updateUserAccess(userId: string, tenantId: string, data: any): Promise<{
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
    getUserById(userId: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        email: string | null;
        username: string;
        password: string;
        role: string;
        dob: string | null;
        address: string | null;
        designation: string | null;
        salary: import("@prisma/client-runtime-utils").Decimal | null;
        pageAccess: import("@prisma/client/runtime/client").JsonValue | null;
    } | null>;
}
