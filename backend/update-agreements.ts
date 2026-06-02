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

const NEW_IPAA_TEMPLATE = `
${DOC_HEADER}
<div style="font-family:'Inter',sans-serif;padding:10px;line-height:1.6;color:#1e293b;font-size:13px;">
  <h1 style="font-size:18px;font-weight:800;color:#0f172a;margin-bottom:4px;text-align:center;letter-spacing:0.5px;">INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT (IPAA)</h1>
  <p style="color:#64748b;font-size:12px;margin-bottom:20px;text-align:center;">This Intellectual Property Assignment Agreement (&ldquo;Agreement&rdquo;) is made and entered into on {{joiningDate}}, by and between:</p>

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

  <p style="margin-bottom:20px;font-style:italic;color:#64748b;text-align:center;">Collectively referred to as the &ldquo;Parties&rdquo;.</p>

  <div style="space-y-4;">
    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">1. PURPOSE</strong>
      <p style="margin:0;">The purpose of this Agreement is to ensure that all intellectual property, inventions, developments, and work products created by the Employee during the course of employment or engagement with <strong>HIG AI Automation LLP</strong> remain the exclusive property of the Company.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">2. DEFINITIONS</strong>
      <p style="margin:0 0 6px 0;">For the purpose of this Agreement, &ldquo;Intellectual Property&rdquo; (&ldquo;IP&rdquo;) includes but is not limited to:</p>
      <ul style="margin:0;padding-left:20px;display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;">
        <li>Software and source code</li>
        <li>AI automation systems</li>
        <li>Scripts and APIs</li>
        <li>Websites and applications</li>
        <li>Databases and dashboards</li>
        <li>UI/UX designs</li>
        <li>Logos, graphics, &amp; branding</li>
        <li>Marketing content &amp; strategies</li>
        <li>Business methods &amp; workflows</li>
        <li>Technical documentation</li>
        <li>Trade secrets</li>
        <li>Client deliverables</li>
      </ul>
      <p style="margin:0;font-size:11px;color:#64748b;font-style:italic;">Whether developed individually or collaboratively.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">3. ASSIGNMENT OF INTELLECTUAL PROPERTY</strong>
      <p style="margin:0;">The Employee hereby irrevocably assigns, transfers, and conveys to <strong>HIG AI Automation LLP</strong> all worldwide rights, title, and interest in any Intellectual Property created, developed, conceived, or reduced to practice during employment with the Company, company-sponsored projects, use of company resources, or work related to company business or clients. This assignment applies whether such work is created during office hours or outside working hours if related to Company business.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">4. WORK MADE FOR HIRE</strong>
      <p style="margin:0;">All work created by the Employee during employment shall be considered &ldquo;Work Made for Hire&rdquo; under applicable intellectual property laws. The Company shall be the sole and exclusive owner of all such work products.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">5. COMPANY RESOURCES</strong>
      <p style="margin:0;">Any work developed using company devices, software, accounts, systems, infrastructure, client information, or internal tools shall automatically become the exclusive property of <strong>HIG AI Automation LLP</strong>.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">6. DISCLOSURE OBLIGATION</strong>
      <p style="margin:0;">The Employee agrees to promptly disclose to the Company any invention, innovation, design, development, improvement, automation process, software code, or creative work created during the course of employment.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">7. PRE-EXISTING INTELLECTUAL PROPERTY</strong>
      <p style="margin:0 0 6px 0;">The Employee shall disclose any pre-existing intellectual property owned before joining the Company. Such pre-existing IP shall remain the property of the Employee unless explicitly assigned in writing.</p>
      <div style="border:1px dashed #cbd5e1;padding:10px;border-radius:6px;font-style:italic;color:#64748b;font-size:11px;">
        Pre-Existing IP Disclosure (if any): None
      </div>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">8. RESTRICTIONS</strong>
      <p style="margin:0 0 6px 0;">The Employee shall not:</p>
      <ul style="margin:0;padding-left:20px;">
        <li style="margin-bottom:4px;">Reuse company-developed code or systems for personal business</li>
        <li style="margin-bottom:4px;">Share proprietary materials with third parties</li>
        <li style="margin-bottom:4px;">Sell or license company-created assets</li>
        <li style="margin-bottom:4px;">Claim ownership of Company IP</li>
        <li style="margin-bottom:4px;">Copy internal systems or workflows</li>
      </ul>
      <p style="margin:0;font-size:11px;color:#64748b;font-style:italic;">without prior written consent from the Company.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">9. MORAL RIGHTS WAIVER</strong>
      <p style="margin:0;">To the extent permitted by law, the Employee waives any moral rights, authorship claims, or similar rights relating to Company-owned intellectual property.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">10. ASSISTANCE &amp; COOPERATION</strong>
      <p style="margin:0;">The Employee agrees to cooperate with the Company in filing patents, registering copyrights, trademark applications, legal documentation, and IP enforcement procedures, even after termination of employment, if reasonably requested by the Company.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">11. CONFIDENTIALITY</strong>
      <p style="margin:0;">Any intellectual property or related information developed during employment shall be treated as confidential and subject to the Company&rsquo;s NDA and confidentiality policies.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">12. TERMINATION</strong>
      <p style="margin:0;">Termination or resignation shall not affect the Company&rsquo;s ownership rights over intellectual property created during employment. All Company-owned assets and materials must be returned immediately upon termination.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">13. BREACH OF AGREEMENT</strong>
      <p style="margin:0;">Any unauthorized use, disclosure, copying, or misuse of Company intellectual property may result in legal action, financial damages, injunctions, criminal or civil liability, and immediate termination.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">14. GOVERNING LAW</strong>
      <p style="margin:0;">This Agreement shall be governed by the laws of India and subject to the jurisdiction of the courts of <strong>Tirunelveli, Tamil Nadu</strong>.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">15. ENTIRE AGREEMENT</strong>
      <p style="margin:0;">This Agreement constitutes the complete understanding between the Parties concerning intellectual property ownership and supersedes all prior discussions or understandings.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">16. ACCEPTANCE</strong>
      <p style="margin:0;">By signing below, the Employee acknowledges that they have read, understood, and agreed to all terms and conditions of this Intellectual Property Assignment Agreement.</p>
    </div>
  </div>

  <div style="border-top:2px dashed #cbd5e1;padding-top:20px;margin-top:30px;page-break-inside:avoid;">
    <h3 style="font-size:13px;color:#0f172a;margin-bottom:15px;font-weight:800;text-align:center;letter-spacing:0.5px;">SIGNATURES</h3>
    
    <table style="width:100%;margin-top:25px;font-size:11px;border-collapse:collapse;">
      <tr>
        <td style="width:33%;padding-bottom:15px;font-weight:700;vertical-align:top;">FOR HIG AI AUTOMATION LLP</td>
        <td style="width:33%;padding-bottom:15px;font-weight:700;vertical-align:top;">EMPLOYEE</td>
        <td style="width:33%;padding-bottom:15px;font-weight:700;vertical-align:top;">WITNESS (Optional)</td>
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
        <td style="color:#64748b;padding-bottom:15px;vertical-align:top;">
          Witness Signature<br/>
          Name: ____________________<br/>
          Date: ____________________
        </td>
      </tr>
    </table>
  </div>

  <p style="font-size:10px;color:#94a3b8;margin-top:30px;text-align:center;font-style:italic;">This document is confidential and legally binding under applicable intellectual property laws.</p>
</div>`;

async function run() {
  if (!Handlebars.helpers['or']) {
    Handlebars.registerHelper('or', function (a, b) {
      return a || b;
    });
  }

  // 1. Update IPAA template in DB
  await prisma.documentTemplate.updateMany({
    where: { name: 'IP Assignment Agreement (IPAA)' },
    data: { contentHtml: NEW_IPAA_TEMPLATE }
  });

  const ipaaTemplate = await prisma.documentTemplate.findFirst({
    where: { name: 'IP Assignment Agreement (IPAA)' }
  });

  if (ipaaTemplate) {
    const docs = await prisma.generatedDocument.findMany({
      where: {
        templateId: ipaaTemplate.id,
        status: 'generated'
      }
    });

    console.log(`Found ${docs.length} generated unsigned IPAA documents to update.`);

    for (const doc of docs) {
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

        const compiled = Handlebars.compile(NEW_IPAA_TEMPLATE);
        const contentHtml = compiled(data);

        await prisma.generatedDocument.update({
          where: { id: doc.id },
          data: { compiledHtml: contentHtml }
        });
        console.log(`Updated IPAA for: ${employee.firstName} ${employee.lastName}`);
      }
    }
  }

  console.log('Update finished successfully.');
  process.exit(0);
}

run();
