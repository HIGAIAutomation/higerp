import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  async createEntry(tenantId: string, authorId: string, data: any) {
    return this.prisma.knowledgeBase.create({
      data: {
        tenantId,
        authorId,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
      },
    });
  }

  async searchEntries(tenantId: string, query: string) {
    return this.prisma.knowledgeBase.findMany({
      where: {
        tenantId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }
}
