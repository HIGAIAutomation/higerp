import { KnowledgeService } from './knowledge.service';
export declare class KnowledgeController {
    private knowledgeService;
    constructor(knowledgeService: KnowledgeService);
    createEntry(body: any, req: any): Promise<{
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
    search(query: string, req: any): Promise<{
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
