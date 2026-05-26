import { PrismaService } from '../prisma/prisma.service';
export declare class KnowledgeService {
    private prisma;
    constructor(prisma: PrismaService);
    createEntry(tenantId: string, authorId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        category: string | null;
        updatedAt: Date;
        title: string;
        content: string;
        tags: string[];
        authorId: string;
    }>;
    searchEntries(tenantId: string, query: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        category: string | null;
        updatedAt: Date;
        title: string;
        content: string;
        tags: string[];
        authorId: string;
    }[]>;
}
