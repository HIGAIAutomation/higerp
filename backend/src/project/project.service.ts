import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentService } from '../document/document.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private documentService: DocumentService,
  ) {}

  async createProject(tenantId: string, data: any) {
    let clientId: string | null = null;
    if (data.clientUsername) {
      const existingUser = await this.prisma.user.findFirst({
        where: { username: data.clientUsername, tenantId },
      });
      if (existingUser) {
        throw new BadRequestException('Client username is already taken');
      }
      if (!data.clientPassword) {
        throw new BadRequestException('Password is required for client account');
      }

      const hashedPassword = await bcrypt.hash(data.clientPassword, 10);
      const clientUser = await this.prisma.user.create({
        data: {
          tenantId,
          email: `${data.clientUsername.toLowerCase()}@hig-client.com`,
          username: data.clientUsername,
          password: hashedPassword,
          role: 'user',
          pageAccess: ['/dashboard', '/dashboard/projects'],
        },
      });
      clientId = clientUser.id;
    }

    const project = await this.prisma.project.create({
      data: {
        tenantId,
        clientId,
        name: data.name,
        category: data.category || 'Web/App Development',
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: 'active',
        whatsappNumber: data.whatsappNumber || null,
        price: data.price ? parseFloat(data.price) : 0,
        modules: data.modules || null,
        platforms: data.platforms || null,
        deliveryCode: !!data.deliveryCode,
        deliveryDocs: !!data.deliveryDocs,
        deliveryDb: !!data.deliveryDb,
        deliveryQa: !!data.deliveryQa,
        deliveryPayment: !!data.deliveryPayment,
        postCount: data.postCount !== undefined ? parseInt(data.postCount, 10) : 0,
        videoCount: data.videoCount !== undefined ? parseInt(data.videoCount, 10) : 0,
      },
    });

    // Lifecycle Documents to auto-generate on project start
    const lifecycleDocs = [
      'Non-Disclosure Agreement (NDA) - Client',
      'Master Service Agreement (MSA)',
      'Statement of Work (SOW)',
      'Project Proposal',
      'Service Level Agreement (SLA)',
      'Intellectual Property Agreement',
      'Data Processing Agreement (DPA)',
    ];

    for (const docName of lifecycleDocs) {
      try {
        await this.documentService.generateDocument(
          docName,
          tenantId,
          { 
            projectName: project.name, 
            clientName: data.clientName || 'Valued Client',
            companyName: 'HIG AI Automation LLP',
            startDate: project.startDate?.toLocaleDateString()
          },
          'PROJECT',
          project.id,
        );
      } catch (error) {
        console.error(`Failed to auto-generate project doc ${docName}: ${error.message}`);
      }
    }

    return project;
  }

  async getProjects(tenantId: string) {
    return this.prisma.project.findMany({
      where: { tenantId },
      include: {
        client: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          }
        }
      }
    });
  }

  async updateProject(id: string, tenantId: string, data: any) {
    const currentProject = await this.prisma.project.findUnique({
      where: { id, tenantId },
    });
    if (!currentProject) {
      throw new NotFoundException('Project not found');
    }

    let clientId = currentProject.clientId;
    if (data.clientUsername) {
      if (clientId) {
        const existingWithUsername = await this.prisma.user.findFirst({
          where: { username: data.clientUsername, tenantId, NOT: { id: clientId } },
        });
        if (existingWithUsername) {
          throw new BadRequestException('Client username is already taken');
        }

        const userUpdateData: any = { username: data.clientUsername };
        if (data.clientPassword) {
          userUpdateData.password = await bcrypt.hash(data.clientPassword, 10);
        }
        await this.prisma.user.update({
          where: { id: clientId },
          data: userUpdateData,
        });
      } else {
        const existingUser = await this.prisma.user.findFirst({
          where: { username: data.clientUsername, tenantId },
        });
        if (existingUser) {
          throw new BadRequestException('Client username is already taken');
        }
        if (!data.clientPassword) {
          throw new BadRequestException('Password is required for a new client account');
        }

        const hashedPassword = await bcrypt.hash(data.clientPassword, 10);
        const clientUser = await this.prisma.user.create({
          data: {
            tenantId,
            email: `${data.clientUsername.toLowerCase()}@hig-client.com`,
            username: data.clientUsername,
            password: hashedPassword,
            role: 'user',
            pageAccess: ['/dashboard', '/dashboard/projects'],
          },
        });
        clientId = clientUser.id;
      }
    }

    // 1. Validation for module count increase
    const oldModules = currentProject.modules
      ? currentProject.modules.split(',').map((m: string) => m.trim()).filter(Boolean)
      : [];
    const newModules = data.modules
      ? data.modules.split(',').map((m: string) => m.trim()).filter(Boolean)
      : [];

    if (newModules.length > oldModules.length) {
      const oldPrice = Number(currentProject.price || 0);
      const newPrice = Number(data.price || 0);
      if (newPrice <= oldPrice) {
        throw new BadRequestException(
          'Target modules count has increased. You must increase the project price.'
        );
      }

      if (!data.endDate) {
        throw new BadRequestException(
          'Target modules count has increased. You must specify an estimated end date extension.'
        );
      }
      const oldEndDate = currentProject.endDate ? new Date(currentProject.endDate).getTime() : null;
      const newEndDate = new Date(data.endDate).getTime();
      if (oldEndDate && newEndDate <= oldEndDate) {
        throw new BadRequestException(
          'Target modules count has increased. You must extend the estimated end date.'
        );
      }
    }

    // 2. Validation for completion
    const isCompleted = data.status === 'completed';
    if (isCompleted) {
      const deliveryCode = data.deliveryCode !== undefined ? !!data.deliveryCode : !!currentProject.deliveryCode;
      const deliveryDocs = data.deliveryDocs !== undefined ? !!data.deliveryDocs : !!currentProject.deliveryDocs;
      const deliveryDb = data.deliveryDb !== undefined ? !!data.deliveryDb : !!currentProject.deliveryDb;
      const deliveryQa = data.deliveryQa !== undefined ? !!data.deliveryQa : !!currentProject.deliveryQa;
      const deliveryPayment = data.deliveryPayment !== undefined ? !!data.deliveryPayment : !!currentProject.deliveryPayment;

      if (!deliveryCode || !deliveryDocs || !deliveryDb || !deliveryQa || !deliveryPayment) {
        throw new BadRequestException(
          'Cannot complete the project until all 5 delivery checklist items are completed.'
        );
      }
    }

    return this.prisma.project.update({
      where: { id, tenantId },
      data: {
        clientId,
        name: data.name,
        category: data.category,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || 'active',
        whatsappNumber: data.whatsappNumber,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
        modules: data.modules,
        platforms: data.platforms,
        deliveryCode: data.deliveryCode !== undefined ? !!data.deliveryCode : undefined,
        deliveryDocs: data.deliveryDocs !== undefined ? !!data.deliveryDocs : undefined,
        deliveryDb: data.deliveryDb !== undefined ? !!data.deliveryDb : undefined,
        deliveryQa: data.deliveryQa !== undefined ? !!data.deliveryQa : undefined,
        deliveryPayment: data.deliveryPayment !== undefined ? !!data.deliveryPayment : undefined,
        postCount: data.postCount !== undefined ? parseInt(data.postCount, 10) : undefined,
        videoCount: data.videoCount !== undefined ? parseInt(data.videoCount, 10) : undefined,
      },
    });
  }

  async deleteProject(id: string, tenantId: string) {
    // Delete associated documents first
    await this.prisma.generatedDocument.deleteMany({
      where: { entityId: id, entityType: 'PROJECT', tenantId },
    });

    return this.prisma.project.delete({
      where: { id, tenantId },
    });
  }
}
