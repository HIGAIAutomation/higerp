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
</div>`,

  'NDA (Employee)': `
${DOC_HEADER}
<div style="font-family:'Inter',sans-serif;padding:10px;line-height:1.6;color:#1e293b;font-size:13px;">
  <h1 style="font-size:20px;font-weight:800;color:#0f172a;margin-bottom:4px;text-align:center;letter-spacing:1px;">NON-DISCLOSURE AGREEMENT (NDA)</h1>
  <h2 style="font-size:14px;font-weight:700;color:#64748b;margin-bottom:15px;text-align:center;text-transform:uppercase;">EMPLOYEE CONFIDENTIALITY AGREEMENT</h2>
  <p style="color:#64748b;font-size:12px;margin-bottom:20px;text-align:center;">This Non-Disclosure Agreement (&ldquo;Agreement&rdquo;) is made and entered into on {{joiningDate}}, by and between:</p>

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

  <p style="margin-bottom:20px;">Both parties agree to the following terms and conditions:</p>

  <div style="space-y-4;">
    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">1. PURPOSE</strong>
      <p style="margin:0;">The Employee acknowledges that during the course of employment with <strong>${COMPANY}</strong>, they may gain access to confidential, proprietary, and sensitive information related to the Company, its clients, projects, systems, operations, and business strategies. The purpose of this Agreement is to protect such confidential information from unauthorized disclosure or misuse.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">2. CONFIDENTIAL INFORMATION</strong>
      <p style="margin:0 0 6px 0;">&ldquo;Confidential Information&rdquo; includes, but is not limited to:</p>
      <ul style="margin:0;padding-left:20px;display:grid;grid-template-columns:1fr 1fr;gap:4px;">
        <li>Client databases and client information</li>
        <li>AI automation systems and workflows</li>
        <li>Source code and software applications</li>
        <li>Website projects and development assets</li>
        <li>Marketing strategies and campaigns</li>
        <li>Financial information and pricing</li>
        <li>Login credentials and passwords</li>
        <li>Internal documents and reports</li>
        <li>Sales data and lead information</li>
        <li>Employee and vendor information</li>
        <li>Business plans and operational methods</li>
        <li>Any non-public information belonging to the Company or its clients</li>
      </ul>
      <p style="margin:6px 0 0 0;font-size:11px;color:#64748b;font-style:italic;">Confidential information may be shared verbally, digitally, visually, or in written form.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">3. EMPLOYEE OBLIGATIONS</strong>
      <p style="margin:0 0 6px 0;">The Employee agrees that they shall:</p>
      <ul style="margin:0;padding-left:20px;">
        <li style="margin-bottom:4px;">Keep all confidential information strictly private.</li>
        <li style="margin-bottom:4px;">Use confidential information only for official work purposes.</li>
        <li style="margin-bottom:4px;">Not copy, share, distribute, sell, or disclose company information to any third party.</li>
        <li style="margin-bottom:4px;">Not store confidential data in unauthorized personal devices or accounts.</li>
        <li style="margin-bottom:4px;">Take reasonable care to protect sensitive information from theft, misuse, or unauthorized access.</li>
        <li style="margin-bottom:4px;">Immediately notify the Company in case of any security breach or accidental disclosure.</li>
      </ul>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">4. RESTRICTIONS</strong>
      <p style="margin:0 0 6px 0;">The Employee shall not:</p>
      <ul style="margin:0;padding-left:20px;">
        <li style="margin-bottom:4px;">Share client or company data with outsiders</li>
        <li style="margin-bottom:4px;">Use company resources for personal business</li>
        <li style="margin-bottom:4px;">Reveal internal pricing or strategies</li>
        <li style="margin-bottom:4px;">Disclose source code or project files</li>
        <li style="margin-bottom:4px;">Use confidential information after resignation or termination</li>
        <li style="margin-bottom:4px;">Access unauthorized systems or information</li>
      </ul>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">5. INTELLECTUAL PROPERTY</strong>
      <p style="margin:0 0 6px 0;">All work created, designed, developed, or produced by the Employee during employment, including but not limited to:</p>
      <ul style="margin:0;padding-left:20px;display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px;">
        <li>Software</li>
        <li>Automation systems</li>
        <li>Designs</li>
        <li>Websites</li>
        <li>Marketing content</li>
        <li>AI workflows</li>
        <li>Databases</li>
        <li>Documentation</li>
      </ul>
      <p style="margin:0;">shall remain the sole property of <strong>${COMPANY}</strong>. The Employee shall not claim ownership or reuse such materials without written permission.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">6. RETURN OF COMPANY PROPERTY</strong>
      <p style="margin:0;">Upon resignation, termination, or request by the Company, the Employee shall immediately return company devices, ID cards, documents, files, credentials, access keys, software assets, and client data. The Employee shall permanently delete company data from personal devices if instructed.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">7. TERM OF CONFIDENTIALITY</strong>
      <p style="margin:0;">The confidentiality obligations under this Agreement shall remain valid: <strong>During the period of employment, and for a period of 5 years after termination/resignation</strong>, or until such information becomes publicly available through lawful means.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">8. BREACH OF AGREEMENT</strong>
      <p style="margin:0;">Any breach of this Agreement may result in immediate termination of employment, legal action, financial liability for damages, injunctions or court orders, and criminal or civil proceedings under applicable laws.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">9. NON-COMPETE &amp; NON-SOLICITATION</strong>
      <p style="margin:0;">The Employee agrees that during employment and for <strong>12 months</strong> after leaving the Company, they shall not directly compete with the Company, solicit company clients, recruit company employees, or misuse company or client data for personal gain.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">10. GOVERNING LAW</strong>
      <p style="margin:0;">This Agreement shall be governed by the laws of India and subject to the jurisdiction of the courts of <strong>Tirunelveli, Tamil Nadu</strong>.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">11. ENTIRE AGREEMENT</strong>
      <p style="margin:0;">This Agreement constitutes the complete understanding between the parties concerning confidentiality obligations and supersedes any prior discussions or agreements.</p>
    </div>

    <div style="margin-bottom:15px;">
      <strong style="color:#0f172a;display:block;margin-bottom:4px;">12. ACCEPTANCE</strong>
      <p style="margin:0;">By signing below, the Employee confirms that they have read, understood, and agreed to all terms and conditions of this Non-Disclosure Agreement.</p>
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

  <p style="font-size:10px;color:#94a3b8;margin-top:30px;text-align:center;font-style:italic;">This document is confidential and legally binding under applicable laws.</p>
</div>`,

  'IP Assignment Agreement (IPAA)': `
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
