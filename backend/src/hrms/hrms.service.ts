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
        profDocNumber: data.profDocNumber || null,
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
          include: { template: true },
        });
        return { ...emp, documents };
      }),
    );
  }

  async closeEmployee(tenantId: string, employeeId: string, data: any) {
    const employee = await this.prisma.employee.update({
      where: { id: employeeId, tenantId },
      data: { status: 'inactive' },
    });

    const relievingDate = data.relievingDate
      ? new Date(data.relievingDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const doc = await this.documentService.generateDocument(
      'Closing Agreement',
      tenantId,
      {
        ...employee,
        companyName: 'HIG AI Automation LLP',
        joiningDate: employee.joiningDate
          ? employee.joiningDate.toISOString().split('T')[0]
          : 'N/A',
        relievingDate,
        reason: data.reason || 'Resignation',
      },
      'EMPLOYEE',
      employee.id,
    );

    return { employee, document: doc };
  }

  async generatePayslip(tenantId: string, employeeId: string, month: string, data?: any) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const basicSalary = Number(employee.salaryBasis || 0);
    const bonus = Number(data?.bonus || 0);
    const incentive = Number(data?.incentive || 0);
    const pf = Number(data?.pf || 0);
    const esi = Number(data?.esi || 0);
    const otherDeductions = Number(data?.otherDeductions || 0);

    const grossEarnings = basicSalary + bonus + incentive;
    const totalDeductions = pf + esi + otherDeductions;
    const netSalary = grossEarnings - totalDeductions;

    const doc = await this.documentService.generateDocument(
      'Employee Payslip',
      tenantId,
      {
        ...employee,
        companyName: 'HIG AI Automation LLP',
        month,
        basicSalary: basicSalary.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        bonus: bonus.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        incentive: incentive.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        pf: pf.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        esi: esi.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        otherDeductions: otherDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        grossEarnings: grossEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        totalDeductions: totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        netSalary: netSalary.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      },
      'EMPLOYEE',
      employee.id,
    );

    return doc;
  }
}
