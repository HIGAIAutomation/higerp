import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  async getPosts(tenantId: string, projectId: string, month?: string) {
    return this.prisma.marketingPost.findMany({
      where: {
        tenantId,
        projectId,
        month: month || null,
      },
      orderBy: { platform: 'asc' },
    });
  }

  async upsertPost(tenantId: string, projectId: string, data: any, username: string) {
    const { platform, postType, status, comments, month, assignedTo, dueDate } = data;
    const existing = await this.prisma.marketingPost.findFirst({
      where: {
        tenantId,
        projectId,
        platform,
        postType,
        month: month || null,
      },
    });

    let result;
    if (existing) {
      result = await this.prisma.marketingPost.update({
        where: { id: existing.id },
        data: {
          status: status !== undefined ? status : existing.status,
          comments: comments !== undefined ? comments : existing.comments,
          assignedTo: assignedTo !== undefined ? assignedTo : existing.assignedTo,
          dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existing.dueDate,
          updatedBy: username,
        },
      });
    } else {
      result = await this.prisma.marketingPost.create({
        data: {
          tenantId,
          projectId,
          platform,
          postType,
          status: status || 'inprogress',
          comments: comments || '',
          month: month || null,
          assignedTo: assignedTo || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          updatedBy: username,
        },
      });
    }

    // Create history record
    await this.prisma.marketingPostHistory.create({
      data: {
        tenantId,
        projectId,
        platform: result.platform,
        postType: result.postType,
        status: result.status,
        comments: result.comments,
        month: result.month,
        assignedTo: result.assignedTo,
        dueDate: result.dueDate,
        updatedBy: username,
      },
    });

    // Reset MarketingPost status to 'inprogress' and comments to '' if completed/posted
    if (status === 'posted' || status === 'completed') {
      result = await this.prisma.marketingPost.update({
        where: { id: result.id },
        data: {
          status: 'inprogress',
          comments: '',
        },
      });
    }

    return result;
  }

  async getPostHistory(tenantId: string, projectId?: string, month?: string) {
    const where: any = { tenantId };
    if (projectId) {
      where.projectId = projectId;
    }
    if (month) {
      where.month = month;
    }
    return this.prisma.marketingPostHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllPostsByMonth(tenantId: string, month: string) {
    return this.prisma.marketingPost.findMany({
      where: {
        tenantId,
        month,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTenantUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
      orderBy: { username: 'asc' },
    });
  }


  async getCampaigns(tenantId: string, projectId: string) {
    return this.prisma.adCampaign.findMany({
      where: { tenantId, projectId },
      orderBy: { startDate: 'desc' },
    });
  }

  async createCampaign(tenantId: string, projectId: string, data: any, username: string) {
    return this.prisma.adCampaign.create({
      data: {
        tenantId,
        projectId,
        name: data.name,
        spend: data.spend,
        leads: data.leads,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        updatedBy: username,
      },
    });
  }

  async getSpecialDayPosters(tenantId: string, projectId: string, month: string) {
    return this.prisma.specialDayPoster.findMany({
      where: { tenantId, projectId, month },
    });
  }

  async upsertSpecialDayPoster(tenantId: string, projectId: string, data: any, username: string) {
    const { holidayName, month, scheduledDate, isPlannedOnFirstDay, status } = data;
    const existing = await this.prisma.specialDayPoster.findFirst({
      where: { tenantId, projectId, month, holidayName },
    });

    if (existing) {
      return this.prisma.specialDayPoster.update({
        where: { id: existing.id },
        data: {
          isPlannedOnFirstDay: isPlannedOnFirstDay !== undefined ? isPlannedOnFirstDay : existing.isPlannedOnFirstDay,
          status: status || existing.status,
          updatedBy: username,
        },
      });
    } else {
      return this.prisma.specialDayPoster.create({
        data: {
          tenantId,
          projectId,
          month,
          holidayName,
          scheduledDate: new Date(scheduledDate),
          isPlannedOnFirstDay: !!isPlannedOnFirstDay,
          status: status || 'pending',
          updatedBy: username,
        },
      });
    }
  }

  async getContentSheet(tenantId: string, projectId: string, month: string) {
    return this.prisma.marketingContentSheet.findFirst({
      where: {
        tenantId,
        projectId,
        month,
      },
    });
  }

  async upsertContentSheet(tenantId: string, projectId: string, month: string, data: any) {
    const { items, statuses, campaigns } = data;
    const existing = await this.prisma.marketingContentSheet.findFirst({
      where: {
        tenantId,
        projectId,
        month,
      },
    });

    if (existing) {
      return this.prisma.marketingContentSheet.update({
        where: { id: existing.id },
        data: {
          items: items !== undefined ? items : existing.items,
          statuses: statuses !== undefined ? statuses : existing.statuses,
          campaigns: campaigns !== undefined ? campaigns : existing.campaigns,
        },
      });
    } else {
      return this.prisma.marketingContentSheet.create({
        data: {
          tenantId,
          projectId,
          month,
          items: items || [],
          statuses: statuses || {},
          campaigns: campaigns || {},
        },
      });
    }
  }
}

