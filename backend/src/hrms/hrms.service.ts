import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentService } from '../document/document.service';

@Injectable()
export class HrmsService {
  constructor(
    private prisma: PrismaService,
    private documentService: DocumentService,
  ) {}

  async createEmployee(tenantId: string, data: any) {
    const employee = await this.prisma.employee.create({
      data: {
        tenantId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        designation: data.designation,
        salaryBasis: data.salaryBasis,
        joiningDate: new Date(data.joiningDate),
        status: 'active',
      },
    });

    // Automatically trigger document generation for the new employee
    const docsToGenerate = [
      'Offer Letter',
      'Employment Agreement',
      'NDA (Employee)',
      'IP Assignment Agreement (IPAA)',
    ];

    for (const docName of docsToGenerate) {
      try {
        await this.documentService.generateDocument(
          docName,
          tenantId,
          { ...employee, companyName: 'HIG AI Automation LLP' },
          'EMPLOYEE',
          employee.id,
        );
      } catch (error) {
        console.error(`Failed to auto-generate ${docName}: ${error.message}`);
        // Log failure but don't stop employee creation
      }
    }

    return employee;
  }

  async getEmployees(tenantId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { tenantId },
    });
    return Promise.all(
      employees.map(async (emp: any) => {
        const documents = await this.prisma.generatedDocument.findMany({
          where: { tenantId, entityId: emp.id, entityType: 'EMPLOYEE' },
        });
        return { ...emp, documents };
      }),
    );
  }
}
