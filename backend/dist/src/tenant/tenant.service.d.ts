import { PrismaService } from '../prisma/prisma.service';
export declare class TenantService {
    private prisma;
    constructor(prisma: PrismaService);
    getTenantBySlug(slug: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        slug: string;
        planTier: string;
        dbConfig: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
    getTenantById(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        slug: string;
        planTier: string;
        dbConfig: import("@prisma/client/runtime/client").JsonValue | null;
    }>;
}
