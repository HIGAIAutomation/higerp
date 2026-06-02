import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentService } from '../document/document.service';

const LOGO_URL = 'http://localhost:3001/logo.png';
const COMPANY = 'HIG AI Automation LLP';
const ADDRESS = 'PPCQ+XH5, 6, S Bazaar, Palayamkottai, Tirunelveli, Tamil Nadu 627002';
const LLPIN = 'LLPIN: AAY-0857';
const GSTIN = 'GSTIN: 33ACFHH7098M1ZK';

const DOC_HEADER = `
<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #2E9EDE;padding-bottom:14px;margin-bottom:28px;">
  <div style="display:flex;align-items:center;gap:12px;">
    <img src="${LOGO_URL}" alt="${COMPANY}" style="height:52px;width:auto;border-radius:10px;flex-shrink:0;" />
    <div>
      <div style="font-size:15px;font-weight:800;color:#0f172a;letter-spacing:0.3px;">${COMPANY}</div>
      <div style="font-size:9px;color:#64748b;margin-top:2px;">${ADDRESS}</div>
      <div style="font-size:9px;font-weight:700;color:#2E9EDE;margin-top:1px;">${LLPIN} &nbsp;|&nbsp; ${GSTIN}</div>
    </div>
  </div>
  <div style="text-align:right;">
    <div style="font-size:10px;font-weight:800;color:#1e293b;">OFFICIAL DOCUMENT</div>
    <div style="font-size:8px;color:#64748b;">CONFIDENTIAL &amp; SECURE</div>
  </div>
</div>`;

const TEMPLATES: Record<string, string> = {
  'Offer Letter': `
${DOC_HEADER}
<div style="font-family:'Inter',sans-serif;padding:20px;line-height:1.7;color:#1e293b;">
  <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin-bottom:4px;">OFFER LETTER</h1>
  <p style="color:#64748b;font-size:12px;margin-bottom:30px;">Date: {{joiningDate}}</p>

  <p>Dear <strong>{{firstName}} {{lastName}}</strong>,</p>
  <p>We are pleased to extend an offer of employment to you at <strong>${COMPANY}</strong> for the position of <strong>{{designation}}</strong>.</p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:24px 0;">
    <h3 style="font-size:14px;color:#0f172a;margin-bottom:12px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">EMPLOYMENT DETAILS</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr><td style="padding:6px 0;font-weight:600;width:200px;">Position:</td><td>{{designation}}</td></tr>
      <tr><td style="padding:6px 0;font-weight:600;">Joining Date:</td><td>{{joiningDate}}</td></tr>
      <tr><td style="padding:6px 0;font-weight:600;">Monthly Compensation:</td><td style="font-weight:700;color:#2e9ede;">₹{{salaryBasis}}</td></tr>
      <tr><td style="padding:6px 0;font-weight:600;">Employee ID / Prof. Doc #:</td><td>{{profDocNumber}}</td></tr>
      <tr><td style="padding:6px 0;font-weight:600;">Official Email:</td><td>{{email}}</td></tr>
    </table>
  </div>

  <p>This offer is subject to the successful completion of background verification and signing of the employment agreement.</p>
  <p>We look forward to having you on our team.</p>
  <br/>
  <p style="font-weight:700;">Warm Regards,<br/>${COMPANY}<br/><span style="font-size:11px;color:#64748b;">${ADDRESS}</span></p>

  <div style="margin-top:50px;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px;">
    <span>Authorized Signatory: ___________________________</span>
    <span>Employee Acknowledgement: ___________________________</span>
  </div>
</div>`,

  'Employment Agreement': `
${DOC_HEADER}
<div style="font-family:'Inter',sans-serif;padding:20px;line-height:1.7;color:#1e293b;">
  <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin-bottom:4px;">EMPLOYMENT AGREEMENT</h1>
  <p style="color:#64748b;font-size:12px;margin-bottom:24px;">Effective Date: {{joiningDate}}</p>

  <p>This Employment Agreement is entered into between <strong>${COMPANY}</strong> ("Company") and <strong>{{firstName}} {{lastName}}</strong> ("Employee").</p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
    <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:10px;">1. POSITION &amp; DUTIES</h3>
    <p style="font-size:13px;margin:0;">The Employee shall be employed as <strong>{{designation}}</strong> and shall perform all duties assigned by the Company.</p>
  </div>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
    <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:10px;">2. COMPENSATION</h3>
    <p style="font-size:13px;margin:0;">The Employee shall receive a monthly salary of <strong style="color:#2e9ede;">₹{{salaryBasis}}</strong>, payable on the last working day of each month.</p>
  </div>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
    <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:10px;">3. CONFIDENTIALITY</h3>
    <p style="font-size:13px;margin:0;">The Employee agrees to maintain strict confidentiality of all proprietary, business, and client information of the Company during and after employment.</p>
  </div>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
    <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:10px;">4. TERMINATION</h3>
    <p style="font-size:13px;margin:0;">Either party may terminate this agreement with a notice period of 30 days in writing.</p>
  </div>

  <div style="margin-top:50px;display:grid;grid-template-columns:1fr 1fr;gap:30px;font-size:12px;color:#334155;border-top:1px solid #e2e8f0;padding-top:20px;">
    <div>
      <p style="font-weight:700;margin-bottom:30px;">For ${COMPANY}:</p>
      <p>Signature: ___________________________</p>
      <p>Name: ___________________________</p>
      <p>Date: ___________________________</p>
    </div>
    <div>
      <p style="font-weight:700;margin-bottom:30px;">Employee:</p>
      <p>Signature: ___________________________</p>
      <p>Name: {{firstName}} {{lastName}}</p>
      <p>Date: ___________________________</p>
    </div>
  </div>
</div>`,

  'NDA (Employee)': `
${DOC_HEADER}
<div style="font-family:'Inter',sans-serif;padding:20px;line-height:1.7;color:#1e293b;">
  <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin-bottom:4px;">NON-DISCLOSURE AGREEMENT</h1>
  <p style="color:#64748b;font-size:12px;margin-bottom:24px;">Effective Date: {{joiningDate}}</p>

  <p>This Non-Disclosure Agreement ("NDA") is entered into between <strong>${COMPANY}</strong> ("Disclosing Party") and <strong>{{firstName}} {{lastName}}</strong> ("Receiving Party").</p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
    <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:10px;">1. DEFINITION OF CONFIDENTIAL INFORMATION</h3>
    <p style="font-size:13px;margin:0;">Confidential Information includes all business, technical, financial, client, product, and strategic data disclosed by the Company in any form.</p>
  </div>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
    <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:10px;">2. OBLIGATIONS</h3>
    <p style="font-size:13px;margin:0;">The Receiving Party shall: (a) keep all Confidential Information strictly secret; (b) not disclose any information to third parties; (c) use information solely for performing employment duties; (d) notify immediately upon any unauthorized disclosure.</p>
  </div>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
    <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:10px;">3. DURATION</h3>
    <p style="font-size:13px;margin:0;">This NDA shall remain in effect during the entire period of employment and for <strong>3 years</strong> thereafter.</p>
  </div>

  <div style="margin-top:50px;display:grid;grid-template-columns:1fr 1fr;gap:30px;font-size:12px;color:#334155;border-top:1px solid #e2e8f0;padding-top:20px;">
    <div>
      <p style="font-weight:700;margin-bottom:30px;">For ${COMPANY}:</p>
      <p>Signature: ___________________________</p>
      <p>Name &amp; Designation: ___________________________</p>
    </div>
    <div>
      <p style="font-weight:700;margin-bottom:30px;">Employee:</p>
      <p>Signature: ___________________________</p>
      <p>Name: {{firstName}} {{lastName}}</p>
    </div>
  </div>
</div>`,

  'IP Assignment Agreement (IPAA)': `
${DOC_HEADER}
<div style="font-family:'Inter',sans-serif;padding:20px;line-height:1.7;color:#1e293b;">
  <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin-bottom:4px;">IP ASSIGNMENT AGREEMENT</h1>
  <p style="color:#64748b;font-size:12px;margin-bottom:24px;">Effective Date: {{joiningDate}}</p>

  <p>This Intellectual Property Assignment Agreement is between <strong>${COMPANY}</strong> and <strong>{{firstName}} {{lastName}}</strong> ("Employee") employed as <strong>{{designation}}</strong>.</p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
    <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:10px;">1. ASSIGNMENT OF INVENTIONS</h3>
    <p style="font-size:13px;margin:0;">The Employee hereby assigns to the Company all right, title, and interest in all Inventions — including software, code, algorithms, models, processes, designs, or creative works — made during the employment period using Company resources or relating to Company business.</p>
  </div>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
    <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:10px;">2. WORK-MADE-FOR-HIRE</h3>
    <p style="font-size:13px;margin:0;">All work products created in the course of employment are "works made for hire" under applicable IP law and are owned exclusively by the Company.</p>
  </div>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
    <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:10px;">3. CONTINUING OBLIGATION</h3>
    <p style="font-size:13px;margin:0;">The Employee agrees to execute any additional documents required to perfect the Company's ownership of Inventions, during and after employment.</p>
  </div>

  <div style="margin-top:50px;display:grid;grid-template-columns:1fr 1fr;gap:30px;font-size:12px;color:#334155;border-top:1px solid #e2e8f0;padding-top:20px;">
    <div>
      <p style="font-weight:700;margin-bottom:30px;">For ${COMPANY}:</p>
      <p>Signature: ___________________________</p>
    </div>
    <div>
      <p style="font-weight:700;margin-bottom:30px;">Employee:</p>
      <p>Signature: ___________________________</p>
      <p>Name: {{firstName}} {{lastName}}</p>
    </div>
  </div>
</div>`,

  'Closing Agreement': `
${DOC_HEADER}
<div style="font-family:'Inter',sans-serif;padding:20px;line-height:1.7;color:#1e293b;">
  <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin-bottom:4px;">EMPLOYEE CLOSING AGREEMENT</h1>
  <p style="color:#64748b;font-size:12px;margin-bottom:24px;">Relieving Date: {{relievingDate}}</p>

  <p>This Closing Agreement confirms the separation of <strong>{{firstName}} {{lastName}}</strong> (Designation: {{designation}}) from <strong>${COMPANY}</strong>, effective <strong>{{relievingDate}}</strong>.</p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0;">
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr><td style="padding:6px 0;font-weight:600;width:200px;">Reason for Departure:</td><td>{{reason}}</td></tr>
      <tr><td style="padding:6px 0;font-weight:600;">Joining Date:</td><td>{{joiningDate}}</td></tr>
      <tr><td style="padding:6px 0;font-weight:600;">Relieving Date:</td><td>{{relievingDate}}</td></tr>
    </table>
  </div>

  <p>The Employee confirms that all Company property, credentials, and access have been returned. All confidentiality and IP obligations from employment agreements remain in force.</p>
  <p>The Company wishes the Employee the very best in future endeavours.</p>

  <div style="margin-top:50px;display:grid;grid-template-columns:1fr 1fr;gap:30px;font-size:12px;color:#334155;border-top:1px solid #e2e8f0;padding-top:20px;">
    <div>
      <p style="font-weight:700;margin-bottom:30px;">For ${COMPANY}:</p>
      <p>Signature: ___________________________</p>
    </div>
    <div>
      <p style="font-weight:700;margin-bottom:30px;">Employee:</p>
      <p>Signature: ___________________________</p>
      <p>Name: {{firstName}} {{lastName}}</p>
    </div>
  </div>
</div>`,

  'Employee Payslip': `
${DOC_HEADER}
<div style="font-family:'Inter',sans-serif;padding:20px;line-height:1.7;color:#1e293b;">
  <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin-bottom:4px;">EMPLOYEE PAYSLIP</h1>
  <p style="color:#64748b;font-size:12px;margin-bottom:20px;">Pay Period: {{month}}</p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:20px;">
    <h3 style="font-size:13px;font-weight:700;color:#64748b;margin-bottom:10px;text-transform:uppercase;">Employee Details</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <tr><td style="padding:4px 0;font-weight:600;width:180px;">Name:</td><td>{{firstName}} {{lastName}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:600;">Designation:</td><td>{{designation}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:600;">Email:</td><td>{{email}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:600;">Employee ID:</td><td>{{profDocNumber}}</td></tr>
    </table>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
    <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px;padding:16px;">
      <h3 style="font-size:13px;font-weight:700;color:#065f46;margin-bottom:10px;text-transform:uppercase;">Earnings</h3>
      <table style="width:100%;font-size:12px;border-collapse:collapse;">
        <tr><td style="padding:4px 0;">Basic Salary</td><td style="text-align:right;font-weight:600;">₹{{basicSalary}}</td></tr>
        <tr><td style="padding:4px 0;">Bonus</td><td style="text-align:right;font-weight:600;">₹{{bonus}}</td></tr>
        <tr><td style="padding:4px 0;">Incentive</td><td style="text-align:right;font-weight:600;">₹{{incentive}}</td></tr>
        <tr style="border-top:1px solid #6ee7b7;font-weight:800;color:#065f46;">
          <td style="padding:6px 0 0 0;">Gross Earnings</td>
          <td style="text-align:right;padding:6px 0 0 0;">₹{{grossEarnings}}</td>
        </tr>
      </table>
    </div>
    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:16px;">
      <h3 style="font-size:13px;font-weight:700;color:#991b1b;margin-bottom:10px;text-transform:uppercase;">Deductions</h3>
      <table style="width:100%;font-size:12px;border-collapse:collapse;">
        <tr><td style="padding:4px 0;">PF</td><td style="text-align:right;font-weight:600;">₹{{pf}}</td></tr>
        <tr><td style="padding:4px 0;">ESI</td><td style="text-align:right;font-weight:600;">₹{{esi}}</td></tr>
        <tr><td style="padding:4px 0;">Other</td><td style="text-align:right;font-weight:600;">₹{{otherDeductions}}</td></tr>
        <tr style="border-top:1px solid #fca5a5;font-weight:800;color:#991b1b;">
          <td style="padding:6px 0 0 0;">Total Deductions</td>
          <td style="text-align:right;padding:6px 0 0 0;">₹{{totalDeductions}}</td>
        </tr>
      </table>
    </div>
  </div>

  <div style="background:#2E9EDE;border-radius:12px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:16px;font-weight:800;color:#ffffff;">NET PAY</span>
    <span style="font-size:24px;font-weight:800;color:#ffffff;">₹{{netSalary}}</span>
  </div>

  <p style="font-size:10px;color:#94a3b8;margin-top:20px;text-align:center;">This is a computer generated payslip and does not require a physical signature.</p>
</div>`,

  'Sales Quotation': `
${DOC_HEADER}
<div style="font-family:'Inter',sans-serif;padding:20px;line-height:1.7;color:#1e293b;">
  <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin-bottom:4px;">SALES QUOTATION</h1>
  <p style="color:#64748b;font-size:12px;margin-bottom:24px;">Valid Until: {{validUntil}}</p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:20px;">
    <table style="width:100%;font-size:13px;border-collapse:collapse;">
      <tr><td style="padding:5px 0;font-weight:600;width:180px;">Prepared For:</td><td style="font-weight:700;">{{clientName}}</td></tr>
      <tr><td style="padding:5px 0;font-weight:600;">Package:</td><td>{{packageName}}</td></tr>
      <tr><td style="padding:5px 0;font-weight:600;">Base Investment:</td><td style="font-weight:700;color:#2e9ede;">₹{{basePrice}}</td></tr>
    </table>
  </div>

  <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:12px;">Pricing Tiers</h3>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <thead>
      <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
        <th style="padding:10px;text-align:left;font-weight:700;">Tier</th>
        <th style="padding:10px;text-align:right;font-weight:700;">Price (INR)</th>
      </tr>
    </thead>
    <tbody>
      {{#each tiers}}
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px;font-weight:600;">{{name}}</td>
        <td style="padding:10px;text-align:right;font-weight:700;color:#2e9ede;">₹{{price}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <p style="font-size:11px;color:#94a3b8;margin-top:24px;text-align:center;">This quotation is generated by ${COMPANY} and is valid until the date stated above.</p>
</div>`,
};

@Injectable()
export class HrmsService {
  constructor(
    private prisma: PrismaService,
    private documentService: DocumentService,
  ) {}

  /**
   * Ensure document templates exist in the database for this tenant.
   * Creates them if missing, updates them to use the real HIG logo if outdated.
   */
  private async ensureTemplates(tenantId: string): Promise<void> {
    for (const [name, contentHtml] of Object.entries(TEMPLATES)) {
      const existing = await this.prisma.documentTemplate.findFirst({
        where: { name, tenantId },
      });
      if (!existing) {
        await this.prisma.documentTemplate.create({
          data: { tenantId, name, category: 'HRMS', contentHtml },
        });
      } else {
        // Always update to latest template (ensures logo is current)
        await this.prisma.documentTemplate.update({
          where: { id: existing.id },
          data: { contentHtml },
        });
      }
    }
  }

  async generateOnboardingDocuments(tenantId: string, employee: any) {
    await this.ensureTemplates(tenantId);

    const docsToGenerate = [
      'Offer Letter',
      'Employment Agreement',
      'NDA (Employee)',
      'IP Assignment Agreement (IPAA)',
    ];

    const generatedDocs: any[] = [];
    for (const docName of docsToGenerate) {
      try {
        const doc = await this.documentService.generateDocument(
          docName,
          tenantId,
          {
            ...employee,
            companyName: COMPANY,
            joiningDate: employee.joiningDate
              ? new Date(employee.joiningDate).toISOString().split('T')[0]
              : 'N/A',
          },
          'EMPLOYEE',
          employee.id,
        );
        generatedDocs.push(doc);
      } catch (error) {
        console.error(`Failed to auto-generate ${docName}: ${error.message}`);
      }
    }
    return generatedDocs;
  }

  async createEmployee(tenantId: string, data: any) {
    // Seed/update HRMS document templates before creating employee
    await this.ensureTemplates(tenantId);

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
        metadata: data.metadata || null,
      },
    });

    const generatedDocs = await this.generateOnboardingDocuments(tenantId, employee);
    return { ...employee, documents: generatedDocs };
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
    await this.ensureTemplates(tenantId);

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
        companyName: COMPANY,
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
    await this.ensureTemplates(tenantId);

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
        companyName: COMPANY,
        month,
        joiningDate: employee.joiningDate
          ? employee.joiningDate.toISOString().split('T')[0]
          : 'N/A',
        basicSalary: basicSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        bonus: bonus.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        incentive: incentive.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        pf: pf.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        esi: esi.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        otherDeductions: otherDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        grossEarnings: grossEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        totalDeductions: totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        netSalary: netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      },
      'EMPLOYEE',
      employee.id,
    );

    return doc;
  }
}
