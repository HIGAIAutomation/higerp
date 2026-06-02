import { Injectable } from '@nestjs/common';
import { DocumentService } from '../document/document.service';
import { PrismaService } from '../prisma/prisma.service';

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

const TEMPLATES: Record<string, string> = {
  'Offer Letter': `
${DOC_HEADER}
<div style="font-family:'Inter',sans-serif;padding:10px;line-height:1.6;color:#1e293b;font-size:13px;">
  <h1 style="font-size:20px;font-weight:800;color:#0f172a;margin-bottom:4px;text-align:center;letter-spacing:1px;">OFFER LETTER</h1>
  <p style="color:#64748b;font-size:12px;margin-bottom:20px;">Date: {{joiningDate}}</p>

  <p>Dear <strong>{{firstName}} {{lastName}}</strong>,</p>
  <p>We are pleased to extend an offer of employment to you at <strong>HIG AI Automation LLP</strong> for the position of <strong>{{designation}}</strong>.</p>
  <p>We believe your skills, dedication, and experience will be a valuable addition to our growing team, and we are excited to welcome you to the HIG AI Automation family.</p>

  <div style="margin:20px 0;">
    <h3 style="font-size:13px;color:#0f172a;margin-bottom:10px;font-weight:800;letter-spacing:0.5px;">EMPLOYMENT DETAILS</h3>
    <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #cbd5e1;">
      <thead>
        <tr style="background:#f1f5f9;border-bottom:1px solid #cbd5e1;">
          <th style="padding:8px;text-align:left;font-weight:700;width:40%;border-right:1px solid #cbd5e1;">Details</th>
          <th style="padding:8px;text-align:left;font-weight:700;width:60%;">Information</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px;font-weight:600;border-right:1px solid #cbd5e1;">Position</td>
          <td style="padding:8px;text-transform:capitalize;">{{designation}}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px;font-weight:600;border-right:1px solid #cbd5e1;">Employment Type</td>
          <td style="padding:8px;">Full-Time</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px;font-weight:600;border-right:1px solid #cbd5e1;">Joining Date</td>
          <td style="padding:8px;">{{joiningDate}}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px;font-weight:600;border-right:1px solid #cbd5e1;">Work Location</td>
          <td style="padding:8px;">Tirunelveli, Tamil Nadu</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px;font-weight:600;border-right:1px solid #cbd5e1;">Monthly Compensation</td>
          <td style="padding:8px;font-weight:700;">₹{{salaryBasis}} + Performance Incentives</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px;font-weight:600;border-right:1px solid #cbd5e1;">Working Hours</td>
          <td style="padding:8px;">Monday – Saturday, 9:30 AM – 6:30 PM</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px;font-weight:600;border-right:1px solid #cbd5e1;">Employee ID / Prof. Doc</td>
          <td style="padding:8px;">{{profDocNumber}}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:8px;font-weight:600;border-right:1px solid #cbd5e1;">Official Email</td>
          <td style="padding:8px;">{{email}}</td>
        </tr>
        <tr>
          <td style="padding:8px;font-weight:600;border-right:1px solid #cbd5e1;">Reporting To</td>
          <td style="padding:8px;">Team Lead / HR Department</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div style="margin:20px 0;">
    <h3 style="font-size:13px;color:#0f172a;margin-bottom:8px;font-weight:800;letter-spacing:0.5px;">TERMS &amp; CONDITIONS</h3>
    <ol style="padding-left:20px;margin:0;">
      <li style="margin-bottom:8px;">
        <strong>Probation Period</strong><br/>
        You will be on a probation period of 3 months from the date of joining. Your performance and conduct will be reviewed during this period.
      </li>
      <li style="margin-bottom:8px;">
        <strong>Compensation</strong><br/>
        Your compensation structure and incentives will be governed by company policies and may be revised periodically based on performance.
      </li>
      <li style="margin-bottom:8px;">
        <strong>Confidentiality</strong><br/>
        You agree not to disclose any confidential company information, client data, internal processes, or project-related materials during or after your employment with the company.
      </li>
      <li style="margin-bottom:8px;">
        <strong>Company Policies</strong><br/>
        You will be expected to comply with all company policies, operational procedures, and ethical standards applicable at HIG AI Automation LLP.
      </li>
      <li style="margin-bottom:8px;">
        <strong>Termination</strong><br/>
        Either party may terminate the employment by providing 15 days prior written notice or salary in lieu of notice, subject to company policies.
      </li>
      <li style="margin-bottom:8px;">
        <strong>Background Verification</strong><br/>
        This offer is subject to successful completion of background verification and submission of all required documents.
      </li>
    </ol>
  </div>

  <p>We are confident that your contribution will play an important role in our company’s growth and success. We look forward to a long and successful professional association with you.</p>

  <div style="margin-top:20px;margin-bottom:30px;">
    <p style="margin:0;">Warm Regards,</p>
    <p style="font-weight:800;margin:4px 0;">HIG AI Automation LLP</p>
    <p style="color:#64748b;font-size:11px;margin:2px 0;line-height:1.4;">
      PPCQ+XH5, 6, S Bazaar,<br/>
      Palayamkottai, Tirunelveli,<br/>
      Tamil Nadu – 627002
    </p>
    <p style="color:#64748b;font-size:11px;margin:4px 0;line-height:1.4;">
      📞 +91 63817 26852<br/>
      📧 info@higaiautomation.com<br/>
      🌐 www.higaiautomation.com
    </p>
  </div>

  <div style="border-top:2px dashed #cbd5e1;padding-top:20px;margin-top:30px;page-break-inside:avoid;">
    <h3 style="font-size:13px;color:#0f172a;margin-bottom:15px;font-weight:800;text-align:center;letter-spacing:0.5px;">OFFER ACCEPTANCE</h3>
    <p>I, <strong>________________________________________</strong>, hereby accept the employment offer and agree to abide by the terms and conditions mentioned above.</p>
    
    <table style="width:100%;margin-top:25px;font-size:11px;border-collapse:collapse;">
      <tr>
        <td style="width:50%;padding-bottom:15px;font-weight:700;">Employer Signature</td>
        <td style="width:50%;padding-bottom:15px;font-weight:700;">Employee Signature</td>
      </tr>
      <tr>
        <td style="padding-bottom:5px;">____________________</td>
        <td style="padding-bottom:5px;">____________________</td>
      </tr>
      <tr>
        <td style="color:#64748b;padding-bottom:15px;">Authorized Signatory</td>
        <td style="color:#64748b;padding-bottom:15px;">Candidate Signature</td>
      </tr>
      <tr>
        <td>Date: _____________</td>
        <td>Date: _____________</td>
      </tr>
    </table>
  </div>

  <p style="font-size:10px;color:#94a3b8;margin-top:30px;text-align:center;font-style:italic;">This document is system generated by HIG AI Automation LLP and does not require a physical signature.</p>
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
    console.log(`[HRMS] Starting document generation for employee: ${employee.firstName} ${employee.lastName} (ID: ${employee.id})`);
    
    await this.ensureTemplates(tenantId);
    console.log(`[HRMS] Templates ensured for tenant: ${tenantId}`);

    const docsToGenerate = [
      'Offer Letter',
      'Employment Agreement',
      'NDA (Employee)',
      'IP Assignment Agreement (IPAA)',
    ];

    const generatedDocs: any[] = [];
    for (const docName of docsToGenerate) {
      try {
        console.log(`[HRMS] Generating document: ${docName}`);
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
        console.log(`[HRMS] Successfully generated: ${docName} (Doc ID: ${doc.id})`);
        generatedDocs.push(doc);
      } catch (error) {
        console.error(`[HRMS] Failed to auto-generate ${docName}:`, error);
      }
    }
    console.log(`[HRMS] Document generation complete. Total docs: ${generatedDocs.length}`);
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

  async getEmployee(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const documents = await this.prisma.generatedDocument.findMany({
      where: { tenantId, entityId: employee.id, entityType: 'EMPLOYEE' },
      include: { template: true },
    });

    return { ...employee, documents };
  }

  async getOfferLetter(tenantId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Find the Offer Letter template
    const template = await this.prisma.documentTemplate.findFirst({
      where: { tenantId, name: 'Offer Letter' },
    });

    if (!template) {
      return null;
    }

    const offerLetter = await this.prisma.generatedDocument.findFirst({
      where: {
        tenantId,
        entityId: employee.id,
        entityType: 'EMPLOYEE',
        templateId: template.id,
      },
      include: { template: true },
    });

    return offerLetter || null;
  }

  async regenerateOfferLetter(tenantId: string, employeeId: string) {
    await this.ensureTemplates(tenantId);

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, tenantId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Find the Offer Letter template
    const template = await this.prisma.documentTemplate.findFirst({
      where: { tenantId, name: 'Offer Letter' },
    });

    if (!template) {
      throw new Error('Offer Letter template not found');
    }

    // Delete existing offer letter
    await this.prisma.generatedDocument.deleteMany({
      where: {
        tenantId,
        entityId: employee.id,
        entityType: 'EMPLOYEE',
        templateId: template.id,
      },
    });

    // Generate new offer letter
    const doc = await this.documentService.generateDocument(
      'Offer Letter',
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

    return doc;
  }
}
