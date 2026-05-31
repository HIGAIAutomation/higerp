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
    // 1. Calculate financial year string (e.g. "26-27") based on project start date
    const startDateObj = data.startDate ? new Date(data.startDate) : new Date();
    const year = startDateObj.getFullYear();
    const month = startDateObj.getMonth() + 1;
    let fyStart: number;
    let fyEnd: number;
    if (month >= 4) {
      fyStart = year;
      fyEnd = year + 1;
    } else {
      fyStart = year - 1;
      fyEnd = year;
    }
    const fyStr = `${String(fyStart).slice(-2)}-${String(fyEnd).slice(-2)}`;

    // 2. Generate customized sequential Project ID
    const count = await this.prisma.project.count({
      where: { tenantId }
    });
    let sequence = count + 1;
    let customId = `higp-${String(sequence).padStart(3, '0')}-${fyStr}`;
    while (await this.prisma.project.findFirst({ where: { id: customId, tenantId } })) {
      sequence++;
      customId = `higp-${String(sequence).padStart(3, '0')}-${fyStr}`;
    }

    let clientId: string | null = null;
    if (data.clientUsername) {
      const existingUser = await this.prisma.user.findFirst({
        where: { username: data.clientUsername, tenantId },
      });
      if (existingUser) {
        clientId = existingUser.id;
      } else {
        if (!data.clientPassword) {
          throw new BadRequestException('Password is required for client account');
        }

        const hashedPassword = await bcrypt.hash(data.clientPassword, 10);
        // Generate customized User ID for new client portals
        const userCount = await this.prisma.user.count({ 
          where: { 
            tenantId,
            id: { startsWith: 'higc-' }
          } 
        });
        let userSeq = userCount + 1;
        let customUserId = `higc-${String(userSeq).padStart(3, '0')}-${fyStr}`;
        while (await this.prisma.user.findFirst({ where: { id: customUserId, tenantId } })) {
          userSeq++;
          customUserId = `higc-${String(userSeq).padStart(3, '0')}-${fyStr}`;
        }

        const clientUser = await this.prisma.user.create({
          data: {
            id: customUserId,
            tenantId,
            email: data.clientEmail || `${data.clientUsername.toLowerCase()}@hig-client.com`,
            username: data.clientUsername,
            password: hashedPassword,
            role: 'user',
            address: data.clientAddress || null,
            designation: data.clientOccupation || null,
            pageAccess: ['/dashboard', '/dashboard/projects'],
          },
        });
        clientId = clientUser.id;
      }
    }

    const project = await (this.prisma.project as any).create({
      data: {
        id: customId,
        tenantId,
        clientId,
        clientName: data.clientName || null,
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
        socialCredentials: data.socialCredentials || null,
        moduleDetails: data.moduleDetails || null,
        projectInclusions: data.projectInclusions || null,
        clientEmail: data.clientEmail || null,
        clientAddress: data.clientAddress || null,
        gstinNumber: data.gstinNumber || null,
        clientOccupation: data.clientOccupation || null,
      },
    });

    // Kickoff 25% Advance payment for non-Digital Marketing categories (Web, AI, Automation)
    if (project.category !== 'Digital Marketing' && project.price > 0) {
      const invoiceBase = `INV-PROJ-${project.id}`;
      await this.prisma.projectPayment.create({
        data: {
          tenantId,
          projectId: project.id,
          invoiceNumber: `${invoiceBase}-ADVANCE`,
          amount: parseFloat((project.price * 0.25).toFixed(2)),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          status: 'pending',
          whatsappSent: false,
        }
      });
    }

    // Lifecycle Documents to auto-generate on project start
    const isDM = project.category === 'Digital Marketing';
    const lifecycleDocs = [
      isDM ? 'Non-Disclosure Agreement (NDA) - Digital Marketing' : 'Non-Disclosure Agreement (NDA) - Client',
      isDM ? 'Master Service Agreement (MSA) - Digital Marketing' : 'Master Service Agreement (MSA)',
      isDM ? 'Statement of Work (SOW) - Digital Marketing' : 'Statement of Work (SOW)',
      'Project Proposal',
      'Service Level Agreement (SLA)',
      'Intellectual Property Agreement',
      'Data Processing Agreement (DPA)',
    ];

    const docProjectId = project.id.replace(/-/g, '/');
    for (const docName of lifecycleDocs) {
      try {
        await this.documentService.generateDocument(
          docName,
          tenantId,
          { 
            projectId: docProjectId,
            projectName: project.name, 
            clientName: project.clientName || data.clientName || 'Valued Client',
            companyName: 'HIG AI Automation LLP',
            startDate: project.startDate ? new Date(project.startDate).toLocaleDateString() : '____________',
            endDate: project.endDate ? new Date(project.endDate).toLocaleDateString() : '____________',
            price: project.price ? `₹${project.price.toLocaleString('en-IN')}` : '₹6,000.00',
            postCount: project.postCount || 15,
            videoCount: project.videoCount || 6,
            isWebProject: project.category === 'Web/App Development',
            isDigitalMarketing: project.category === 'Digital Marketing',
            isAutomation: project.category === 'Automation',
            isAiDevelopment: project.category === 'AI Development',
            moduleDetails: project.moduleDetails || [],
            projectInclusions: project.projectInclusions || '',
            inclusions: project.projectInclusions ? project.projectInclusions.split(/[,\n]+/).map((x: string) => x.trim()).filter(Boolean) : [],
            clientEmail: project.clientEmail || data.clientEmail || '',
            clientAddress: project.clientAddress || data.clientAddress || '',
            gstinNumber: project.gstinNumber || data.gstinNumber || '',
            clientOccupation: project.clientOccupation || data.clientOccupation || '',
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
        adCampaigns: true,
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

  async updateProject(id: string, tenantId: string, data: any, clientIdFilter?: string) {
    const currentProject = await this.prisma.project.findUnique({
      where: { id, tenantId },
    });
    if (!currentProject) {
      throw new NotFoundException('Project not found');
    }

    // Security check for client users:
    if (clientIdFilter) {
      if (currentProject.clientId !== clientIdFilter) {
        throw new BadRequestException('Forbidden: You do not own this project');
      }

      // Restrict the payload to ONLY update socialCredentials
      return (this.prisma.project as any).update({
        where: { id, tenantId },
        data: {
          socialCredentials: data.socialCredentials !== undefined ? data.socialCredentials : undefined,
        },
      });
    }

    let clientId = currentProject.clientId;
    if (data.clientUsername) {
      const existingUser = await this.prisma.user.findFirst({
        where: { username: data.clientUsername, tenantId },
      });
      if (existingUser) {
        clientId = existingUser.id;
      } else {
        if (clientId) {
          const userUpdateData: any = { username: data.clientUsername };
          if (data.clientPassword) {
            userUpdateData.password = await bcrypt.hash(data.clientPassword, 10);
          }
          await this.prisma.user.update({
            where: { id: clientId },
            data: userUpdateData,
          });
        } else {
          if (!data.clientPassword) {
            throw new BadRequestException('Password is required for a new client account');
          }

          const hashedPassword = await bcrypt.hash(data.clientPassword, 10);

          // Calculate financial year string (e.g. "26-27") based on project start date (or current date as fallback)
          const startDateObj = currentProject.startDate ? new Date(currentProject.startDate) : new Date();
          const year = startDateObj.getFullYear();
          const month = startDateObj.getMonth() + 1;
          let fyStart = month >= 4 ? year : year - 1;
          let fyEnd = month >= 4 ? year + 1 : year;
          const fyStr = `${String(fyStart).slice(-2)}-${String(fyEnd).slice(-2)}`;

          // Generate customized User ID for new client portals
          const userCount = await this.prisma.user.count({ 
            where: { 
              tenantId,
              id: { startsWith: 'higc-' }
            } 
          });
          let userSeq = userCount + 1;
          let customUserId = `higc-${String(userSeq).padStart(3, '0')}-${fyStr}`;
          while (await this.prisma.user.findFirst({ where: { id: customUserId, tenantId } })) {
            userSeq++;
            customUserId = `higc-${String(userSeq).padStart(3, '0')}-${fyStr}`;
          }

          const clientUser = await this.prisma.user.create({
            data: {
              id: customUserId,
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

    // 3. Auto-billing triggers on module completion
    const newModuleDetails = data.moduleDetails;
    if (newModuleDetails && Array.isArray(newModuleDetails) && newModuleDetails.length > 0) {
      const totalModules = newModuleDetails.length;
      const completedModules = newModuleDetails.filter((m: any) => m.completed).length;
      const completionPercentage = completedModules / totalModules;
      const projectPrice = parseFloat(data.price || currentProject.price || 0);
      const invoiceBase = `INV-PROJ-${id}`;

      // 25% Advance payment is generated on startup.
      // The remaining 75% is divided into 3 milestones (25% of total project price each).
      const partAmount = parseFloat((projectPrice * 0.25).toFixed(2));

      // Threshold 1: 33% (Part 1)
      if (completionPercentage >= 0.33) {
        const existPart1 = await this.prisma.projectPayment.findFirst({
          where: { projectId: id, invoiceNumber: `${invoiceBase}-PART1`, tenantId }
        });
        if (!existPart1) {
          await this.prisma.projectPayment.create({
            data: {
              tenantId,
              projectId: id,
              invoiceNumber: `${invoiceBase}-PART1`,
              amount: partAmount,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              status: 'pending',
              whatsappSent: false,
            }
          });
        }
      }

      // Threshold 2: 66% (Part 2)
      if (completionPercentage >= 0.66) {
        const existPart2 = await this.prisma.projectPayment.findFirst({
          where: { projectId: id, invoiceNumber: `${invoiceBase}-PART2`, tenantId }
        });
        if (!existPart2) {
          await this.prisma.projectPayment.create({
            data: {
              tenantId,
              projectId: id,
              invoiceNumber: `${invoiceBase}-PART2`,
              amount: partAmount,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              status: 'pending',
              whatsappSent: false,
            }
          });
        }
      }

      // Threshold 3: 100% (Part 3)
      if (completionPercentage >= 1.0) {
        const existPart3 = await this.prisma.projectPayment.findFirst({
          where: { projectId: id, invoiceNumber: `${invoiceBase}-PART3`, tenantId }
        });
        if (!existPart3) {
          const finalAmount = parseFloat((projectPrice - (3 * partAmount)).toFixed(2));
          await this.prisma.projectPayment.create({
            data: {
              tenantId,
              projectId: id,
              invoiceNumber: `${invoiceBase}-PART3`,
              amount: finalAmount,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              status: 'pending',
              whatsappSent: false,
            }
          });
        }
      }
    }

    const updatedProject = await (this.prisma.project as any).update({
      where: { id, tenantId },
      data: {
        clientId,
        clientName: data.clientName !== undefined ? data.clientName : undefined,
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
        socialCredentials: data.socialCredentials !== undefined ? data.socialCredentials : undefined,
        moduleDetails: data.moduleDetails !== undefined ? data.moduleDetails : undefined,
        projectInclusions: data.projectInclusions !== undefined ? data.projectInclusions : undefined,
        clientEmail: data.clientEmail !== undefined ? data.clientEmail : undefined,
        clientAddress: data.clientAddress !== undefined ? data.clientAddress : undefined,
        gstinNumber: data.gstinNumber !== undefined ? data.gstinNumber : undefined,
        clientOccupation: data.clientOccupation !== undefined ? data.clientOccupation : undefined,
      },
    });

    // Lifecycle Documents to auto-update on project edit
    const isDM = updatedProject.category === 'Digital Marketing';
    const lifecycleDocs = [
      isDM ? 'Non-Disclosure Agreement (NDA) - Digital Marketing' : 'Non-Disclosure Agreement (NDA) - Client',
      isDM ? 'Master Service Agreement (MSA) - Digital Marketing' : 'Master Service Agreement (MSA)',
      isDM ? 'Statement of Work (SOW) - Digital Marketing' : 'Statement of Work (SOW)',
      'Project Proposal',
      'Service Level Agreement (SLA)',
      'Intellectual Property Agreement',
      'Data Processing Agreement (DPA)',
    ];

    const docProjectId = updatedProject.id.replace(/-/g, '/');
    for (const docName of lifecycleDocs) {
      try {
        await this.documentService.generateDocument(
          docName,
          tenantId,
          { 
            projectId: docProjectId,
            projectName: updatedProject.name, 
            clientName: updatedProject.clientName || 'Valued Client',
            companyName: 'HIG AI Automation LLP',
            startDate: updatedProject.startDate ? new Date(updatedProject.startDate).toLocaleDateString() : '____________',
            endDate: updatedProject.endDate ? new Date(updatedProject.endDate).toLocaleDateString() : '____________',
            price: updatedProject.price ? `₹${updatedProject.price.toLocaleString('en-IN')}` : '₹6,000.00',
            postCount: updatedProject.postCount || 15,
            videoCount: updatedProject.videoCount || 6,
            isWebProject: updatedProject.category === 'Web/App Development',
            isDigitalMarketing: updatedProject.category === 'Digital Marketing',
            isAutomation: updatedProject.category === 'Automation',
            isAiDevelopment: updatedProject.category === 'AI Development',
            moduleDetails: updatedProject.moduleDetails || [],
            projectInclusions: updatedProject.projectInclusions || '',
            inclusions: updatedProject.projectInclusions ? updatedProject.projectInclusions.split(/[,\n]+/).map((x: string) => x.trim()).filter(Boolean) : [],
            clientEmail: updatedProject.clientEmail || data.clientEmail || '',
            clientAddress: updatedProject.clientAddress || data.clientAddress || '',
            gstinNumber: updatedProject.gstinNumber || data.gstinNumber || '',
            clientOccupation: updatedProject.clientOccupation || data.clientOccupation || '',
          },
          'PROJECT',
          updatedProject.id,
        );
      } catch (error) {
        console.error(`Failed to auto-generate project doc ${docName} on update: ${error.message}`);
      }
    }

    return updatedProject;
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
