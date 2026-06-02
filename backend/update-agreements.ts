import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import * as Handlebars from 'handlebars';

const prisma = new PrismaClient();

const LOGO_URL = process.env.BACKEND_URL || 'https://higerp.onrender.com/logo.png';
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

const NEW_TEMPLATE = `
${DOC_HEADER}
<div style="font-family:'Inter',sans-serif;padding:10px;line-height:1.6;color:#1e293b;font-size:13px;">
  <h1 style="font-size:20px;font-weight:800;color:#0f172a;margin-bottom:4px;text-align:center;letter-spacing:1px;">EMPLOYMENT AGREEMENT</h1>
  <p style="color:#64748b;font-size:12px;margin-bottom:20px;text-align:center;">This Employment Agreement (&ldquo;Agreement&rdquo;) is made and entered into on {{joiningDate}}, between:</p>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:15px;">
      <h3 style="font-size:11px;color:#64748b;margin-top:0;margin-bottom:6px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;">THE COMPANY</h3>
      <strong style="color:#0f172a;font-size:13px;">${COMPANY}</strong>
      <p style="color:#64748b;font-size:11px;margin:4px 0 0 0;line-height:1.4;">
        ${ADDRESS}
      </p>
    </div>
    
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:15px;">
      <h3 style="font-size:11px;color:#64748b;margin-top:0;margin-bottom:6px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;">THE EMPLOYEE</h3>
      <strong style="color:#0f172a;font-size:13px;">{{firstName}} {{lastName}}</strong>
      <table style="width:100%;font-size:11px;color:#64748b;margin-top:6px;border-collapse:collapse;">
        <tr><td style="padding:2px 0;font-weight:600;width:70px;">Address:</td><td style="color:#334155;">{{or address '___________________________'}}</td></tr>
        <tr><td style="padding:2px 0;font-weight:600;">Phone:</td><td style="color:#334155;">{{or contact '___________________________'}}</td></tr>
        <tr><td style="padding:2px 0;font-weight:600;">Email:</td><td style="color:#334155;word-break:break-all;">{{email}}</td></tr>
      </table>
    </div>
  </div>

  <p style="margin-bottom:20px;">Both parties hereby agree to the following terms and conditions:</p>

  <div style="space-y-4;">
    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">1. APPOINTMENT</strong>
      <p style="margin:0;">The Company hereby appoints the Employee as <strong style="text-transform:capitalize;">{{designation}}</strong>, and the Employee agrees to serve the Company under the terms and conditions set forth in this Agreement.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">2. DATE OF JOINING</strong>
      <p style="margin:0;">The Employee shall commence employment on <strong>{{joiningDate}}</strong>.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">3. PLACE OF WORK</strong>
      <p style="margin:0;">The Employee shall work from: <strong>${COMPANY}, Tirunelveli, Tamil Nadu</strong>. The Company may change the work location, assign remote work, or transfer responsibilities as required.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:6px;">4. EMPLOYMENT TYPE</strong>
      <div style="display:flex;gap:20px;font-size:12px;font-weight:600;color:#334155;background:#f8fafc;padding:10px 15px;border-radius:8px;border:1px solid #e2e8f0;">
        <span>☑ Full-Time</span>
        <span>☐ Part-Time</span>
        <span>☐ Internship</span>
        <span>☐ Contract-Based</span>
      </div>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">5. DUTIES &amp; RESPONSIBILITIES</strong>
      <p style="margin:0 0 6px 0;">The Employee shall:</p>
      <ul style="margin:0;padding-left:20px;">
        <li style="margin-bottom:4px;">Perform assigned duties sincerely and professionally.</li>
        <li style="margin-bottom:4px;">Maintain discipline and ethical behavior.</li>
        <li style="margin-bottom:4px;">Meet project deadlines and reporting requirements.</li>
        <li style="margin-bottom:4px;">Protect company assets and confidential information.</li>
        <li style="margin-bottom:4px;">Follow company policies and management instructions.</li>
      </ul>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">6. WORKING HOURS</strong>
      <p style="margin:0;">The standard working hours shall be: <strong>Monday to Saturday, 9:30 AM &ndash; 6:30 PM</strong>. The Employee may be required to work additional hours depending on project requirements.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">7. COMPENSATION</strong>
      <p style="margin:0;">The Company shall pay the Employee a Monthly Salary of <strong>₹{{salaryBasis}}</strong>. Additional incentives, bonuses, or benefits may be provided based on performance and company policies. Salary shall be credited monthly to the Employee&rsquo;s registered bank account.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">8. PROBATION PERIOD</strong>
      <p style="margin:0;">The Employee shall be under probation for a period of <strong>3 months</strong> from the date of joining. During probation, the Company reserves the right to terminate employment without prior notice if performance or conduct is found unsatisfactory.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">9. CONFIDENTIALITY</strong>
      <p style="margin:0 0 6px 0;">The Employee agrees to maintain complete confidentiality regarding client information, source code, business strategies, marketing plans, financial data, internal documents, AI automation systems, and company credentials/passwords. The Employee shall not disclose or misuse confidential information during or after employment.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">10. INTELLECTUAL PROPERTY</strong>
      <p style="margin:0;">Any work, design, software, code, content, automation systems, or materials developed during employment shall remain the sole property of <strong>${COMPANY}</strong>. The Employee shall not claim ownership rights over company projects or client deliverables.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">11. NON-COMPETE &amp; NON-SOLICITATION</strong>
      <p style="margin:0;">During employment and for a period of <strong>12 months</strong> after leaving the Company, the Employee shall not directly compete with the Company, solicit company clients, recruit company employees, or use company data for personal business purposes.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">12. LEAVE POLICY</strong>
      <p style="margin:0;">The Employee shall be entitled to leave as per company policy. Unauthorized absence or excessive leave without approval may result in disciplinary action.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">13. CODE OF CONDUCT</strong>
      <p style="margin:0;">The Employee shall maintain professional conduct and shall not engage in harassment, fraudulent activities, data theft, misuse of company resources, illegal activities, or defamation of the Company or clients. Violation may result in immediate termination and legal action.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">14. TERMINATION</strong>
      <p style="margin:0;">Either party may terminate this Agreement by giving <strong>15 days</strong> written notice. The Company reserves the right to terminate employment immediately in cases involving misconduct, breach of confidentiality, fraud, poor performance, or policy violations. Upon termination, the Employee must return all company property, credentials, files, and devices.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">15. BACKGROUND VERIFICATION</strong>
      <p style="margin:0;">Employment is subject to successful verification of all documents and information provided by the Employee. Providing false information may result in termination.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">16. GOVERNING LAW</strong>
      <p style="margin:0;">This Agreement shall be governed under the laws of India and subject to the jurisdiction of the courts of <strong>Tirunelveli, Tamil Nadu</strong>.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">17. ACCEPTANCE</strong>
      <p style="margin:0;">By signing this Agreement, the Employee confirms that they have read, understood, and agreed to all terms and conditions mentioned herein.</p>
    </div>
  </div>

  <div style="border-top:2px dashed #cbd5e1;padding-top:20px;margin-top:30px;page-break-inside:avoid;">
    <h3 style="font-size:13px;color:#0f172a;margin-bottom:15px;font-weight:800;text-align:center;letter-spacing:0.5px;">SIGNATURES</h3>
    
    <table style="width:100%;margin-top:25px;font-size:11px;border-collapse:collapse;">
      <tr>
        <td style="width:50%;padding-bottom:15px;font-weight:700;vertical-align:top;">FOR HIG AI AUTOMATION LLP</td>
        <td style="width:50%;padding-bottom:15px;font-weight:700;vertical-align:top;">EMPLOYEE</td>
      </tr>
      <tr>
        <td style="padding-bottom:5px;">
          <!-- Admin/CEO Signature (Default) -->
          <div style="font-family: 'Playfair Display', cursive; font-size: 24px; color: #1e293b; margin: 15px 0 5px 0; font-style: italic;">Ajay S</div>
          ____________________
        </td>
        <td style="padding-bottom:5px;vertical-align:bottom;">
          <div style="height: 40px;"></div>
          ____________________
        </td>
      </tr>
      <tr>
        <td style="color:#64748b;padding-bottom:15px;">
          Authorized Signatory<br/>
          Name: Mr. Ajay S<br/>
          Designation: CEO<br/>
          Date: {{joiningDate}}
        </td>
        <td style="color:#64748b;padding-bottom:15px;vertical-align:top;">
          Candidate Signature<br/>
          Name: {{firstName}} {{lastName}}<br/>
          Date: {{joiningDate}}
        </td>
      </tr>
    </table>
  </div>

  <p style="font-size:10px;color:#94a3b8;margin-top:30px;text-align:center;font-style:italic;">This document is confidential and intended solely for employment purposes under HIG AI Automation LLP.</p>
</div>`;

async function run() {
  if (!Handlebars.helpers['or']) {
    Handlebars.registerHelper('or', function (a, b) {
      return a || b;
    });
  }

  // Find the template ID for Employment Agreement
  const template = await prisma.documentTemplate.findFirst({
    where: { name: 'Employment Agreement' }
  });

  if (!template) {
    console.error('Employment Agreement template not found');
    process.exit(1);
  }

  // Update template HTML in the database just in case
  await prisma.documentTemplate.updateMany({
    where: { name: 'Employment Agreement' },
    data: { contentHtml: NEW_TEMPLATE }
  });

  // Find all generated employment agreements that are unsigned
  const docs = await prisma.generatedDocument.findMany({
    where: {
      templateId: template.id,
      status: 'generated'
    }
  });

  console.log(`Found ${docs.length} generated unsigned agreements to update.`);

  for (const doc of docs) {
    // Fetch the associated employee
    const employee = await prisma.employee.findUnique({
      where: { id: doc.entityId }
    });

    if (employee) {
      const data = {
        ...employee,
        companyName: COMPANY,
        joiningDate: employee.joiningDate
          ? new Date(employee.joiningDate).toISOString().split('T')[0]
          : 'N/A',
        address: (employee.metadata as any)?.address || '',
        contact: (employee.metadata as any)?.contact || '',
      };

      const compiled = Handlebars.compile(NEW_TEMPLATE);
      const contentHtml = compiled(data);

      await prisma.generatedDocument.update({
        where: { id: doc.id },
        data: { compiledHtml: contentHtml }
      });
      console.log(`Updated agreement for: ${employee.firstName} ${employee.lastName}`);
    }
  }

  console.log('Update finished successfully.');
  process.exit(0);
}

run();
