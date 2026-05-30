import { PrismaService } from '../prisma/prisma.service';
export declare class TenantService {
    private prisma;
    constructor(prisma: PrismaService);
    getTenantBySlug(slug: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        planTier: string;
        dbConfig: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
    }>;
    getTenantById(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        planTier: string;
        dbConfig: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
    }>;
}
