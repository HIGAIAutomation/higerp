import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createTicket(tenantId: string, userId: string, data: any) {
    const ticket = await this.prisma.ticket.create({
      data: {
        tenantId,
        userId,
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
      },
    });

    // Simulated AI Summarization Trigger
    this.generateAISummary(ticket.id, data.description);

    return ticket;
  }

  async generateAISummary(ticketId: string, description: string) {
    // In production, call OpenAI/LLM here
    const summary = `AI Summary: ${description.substring(0, 50)}... [Auto-summarized]`;
    
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { aiSummary: summary },
    });
  }

  async getTickets(tenantId: string) {
    return this.prisma.ticket.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
