"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
require("dotenv/config");
const prisma = new client_1.PrismaClient();
async function main() {
    const tenantId = '00000000-0000-0000-0000-000000000000';
    await prisma.tenant.upsert({
        where: { id: tenantId, slug: 'system' },
        update: {},
        create: {
            id: tenantId,
            name: 'HIG System',
            slug: 'system',
        },
    });
    const adminUsername = 'admin';
    const adminPassword = 'admin';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const existingUser = await prisma.user.findFirst({
        where: { username: adminUsername, tenantId }
    });
    if (!existingUser) {
        await prisma.user.create({
            data: {
                username: adminUsername,
                password: hashedAdminPassword,
                tenantId,
                role: 'superadmin',
                pageAccess: ['*'],
            }
        });
        console.log('Seeded default admin user (username: admin, password: admin)');
    }
    else {
        console.log('Admin user already exists');
    }
    const documentStyles = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
  
  .contract-container {
    font-family: 'Inter', sans-serif;
    color: #1e293b;
    line-height: 1.7;
    max-width: 800px;
    margin: 0 auto;
    padding: 30px;
    background: #ffffff;
  }
  
  .document-header {
    margin-bottom: 24px;
  }
  
  .header-branding {
    width: 100%;
    clear: both;
    display: block;
    padding-bottom: 12px;
  }
  
  .header-branding::after {
    content: "";
    display: table;
    clear: both;
  }
  
  .company-logo {
    float: left;
    max-height: 48px;
    max-width: 140px;
    object-fit: contain;
  }
  
  .company-details {
    float: right;
    text-align: right;
  }
  
  .company-name {
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 3px;
    letter-spacing: 0.25px;
  }
  
  .company-meta {
    font-size: 9.5px;
    color: #64748b;
    line-height: 1.4;
  }
  
  .divider {
    border-bottom: 1.5px solid #e2e8f0;
    width: 100%;
    clear: both;
    padding-top: 10px;
  }

  .header-title-block {
    text-align: center;
    margin-top: 25px;
    margin-bottom: 35px;
    clear: both;
  }

  .header-title-block h1 {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    margin: 0 0 6px 0;
    letter-spacing: 0.5px;
  }

  .header-title-block p {
    font-size: 11.5px;
    font-style: italic;
    color: #64748b;
    margin: 0;
  }
  
  .section {
    margin-bottom: 30px;
    clear: both;
  }
  
  .section h2 {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    margin-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 6px;
    letter-spacing: 0.5px;
  }
  
  .section p {
    font-size: 13px;
    color: #334155;
    margin-top: 0;
    text-align: justify;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .section ol, .section ul {
    font-size: 13px;
    color: #334155;
    margin-top: 0;
    padding-left: 20px;
  }

  .section li {
    margin-bottom: 8px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  .signatures {
    margin-top: 50px;
    width: 100%;
    clear: both;
    display: block;
    page-break-inside: avoid;
  }
  
  .signatures::after {
    content: "";
    display: table;
    clear: both;
  }
  
  .sig-col {
    float: left;
    width: 45%;
    font-size: 12px;
  }
  
  .sig-col:last-child {
    float: right;
    width: 45%;
  }
  
  .sig-line {
    border-bottom: 1.5px solid #0f172a;
    margin-top: 45px;
    margin-bottom: 8px;
  }
  
  .sig-label {
    font-size: 11px;
    font-weight: bold;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
</style>

`;
    const templates = [
        {
            name: 'Offer Letter',
            category: 'HR',
            contentHtml: '<h1>Offer Letter</h1><p>Dear {{firstName}}, we are pleased to offer you the position of {{designation}} at {{companyName}}.</p>',
        },
        {
            name: 'NDA (Employee)',
            category: 'HR',
            contentHtml: '<h1>Non-Disclosure Agreement</h1><p>I, {{firstName}} {{lastName}}, agree to protect all trade secrets of {{companyName}}...</p>',
        },
        {
            name: 'IP Assignment Agreement (IPAA)',
            category: 'HR',
            contentHtml: '<h1>IP Assignment</h1><p>{{firstName}}, all code and AI models developed belong to {{companyName}}.</p>',
        },
        {
            name: 'Non-Disclosure Agreement (NDA) - Client',
            category: 'PROJECT',
            contentHtml: documentStyles + `
<div class="contract-container">
  <div class="document-header">
    <div class="header-branding">
      <img src="/logo.png" alt="HIGAI Automation Logo" class="company-logo" onerror="this.style.display='none'" />
      <div class="company-details">
        <div class="company-name">HIGAI Automation LLP</div>
        <div class="company-meta">PPCQ+XH5, 6, S Bazaar, Palayamkottai</div>
        <div class="company-meta">Tirunelveli, Tamil Nadu 627002</div>
        <div class="company-meta">Phone: 63817 26852</div>
      </div>
    </div>
    <div class="divider"></div>
  </div>

  <div class="header-title-block">
    <h1>MUTUAL NON-DISCLOSURE AGREEMENT (NDA)</h1>
    <p>CLIENT AGREEMENT | Effective Date: {{startDate}}</p>
  </div>
  
  {{#if (or isWebProject isAutomation)}}
  <div class="section">
    <p>This Non-Disclosure Agreement (“Agreement”) is entered into on <strong>{{startDate}}</strong>, by and between:</p>
    <p><strong>HIG AI AUTOMATION LLP</strong>, with offices at PPCQ+XH5, 6, S Bazaar, Palayamkottai, Tirunelveli, Tamil Nadu 627002 (hereinafter referred to as “Service Provider” or “Company”)</p>
    <p>AND</p>
    <p><strong>{{clientName}}</strong> (hereinafter referred to as “Client”)</p>
    <p>Both parties collectively referred to as the “Parties”.</p>
  </div>

  <div class="section">
    <h2>1. Purpose</h2>
    <p>The purpose of this Agreement is to protect confidential and proprietary information shared between the Parties in relation to the development, implementation, consultation, deployment, maintenance, and support of the following project: <strong>{{projectName}}</strong>.</p>
    <p>Including but not limited to:</p>
    <ul>
      {{#each moduleDetails}}
      <li><strong>{{this.name}}</strong>{{#if this.description}}: {{this.description}}{{/if}}</li>
      {{/each}}
    </ul>
  </div>

  <div class="section">
    <h2>2. Confidential Information</h2>
    <p>“Confidential Information” includes any non-public information shared verbally, digitally, visually, in writing, or through software systems, including but not limited to:</p>
    <ul>
      <li>Business strategies</li>
      <li>Source code</li>
      <li>Software architecture</li>
      <li>API details</li>
      <li>AI models and workflows</li>
      <li>ERP modules</li>
      {{#each moduleDetails}}
      <li>{{this.name}}</li>
      {{/each}}
      <li>Financial information</li>
      <li>Client databases</li>
      <li>Employee details</li>
      <li>Vendor information</li>
      <li>Product formulas/processes</li>
      <li>Manufacturing workflows</li>
      <li>QR systems</li>
      <li>Login credentials</li>
      <li>Server details</li>
      <li>Reports and analytics</li>
      <li>Automation methods</li>
      <li>Marketing plans</li>
      <li>Technical documentation</li>
      <li>Pricing structures</li>
      <li>Internal communications</li>
      <li>Any project-related data</li>
    </ul>
    <p>Confidential Information also includes screenshots, demos, presentations, diagrams, PDFs, proposals, and training materials shared during the project.</p>
  </div>

  <div class="section">
    <h2>3. Obligations of the Client</h2>
    <p>The Client agrees to:</p>
    <ol>
      <li>Maintain strict confidentiality of all confidential information shared by HIG AI AUTOMATION LLP.</li>
      <li>Not disclose, share, copy, reproduce, publish, or distribute any confidential information to any third party without written consent.</li>
      <li>Use the confidential information solely for project evaluation, implementation, and operational purposes.</li>
      <li>Restrict access only to authorized employees or representatives who require access for project execution.</li>
      <li>Take reasonable security measures to prevent unauthorized access, leakage, or misuse of confidential information.</li>
      <li>Not reverse engineer, duplicate, resell, or recreate any software, automation workflow, dashboard, AI logic, or ERP module developed by HIG AI AUTOMATION LLP.</li>
      <li>Immediately notify HIG AI AUTOMATION LLP if any unauthorized disclosure or security breach occurs.</li>
    </ol>
  </div>

  <div class="section">
    <h2>4. Obligations of HIG AI AUTOMATION LLP</h2>
    <p>HIG AI AUTOMATION LLP agrees to:</p>
    <ol>
      <li>Protect the Client’s confidential business data and operational information.</li>
      <li>Use Client information only for project execution and support purposes.</li>
      <li>Not disclose Client-sensitive information to external parties unless legally required.</li>
      <li>Implement reasonable technical and organizational security practices.</li>
    </ol>
  </div>

  <div class="section">
    <h2>5. Ownership & Intellectual Property</h2>
    <ol>
      <li>All software, AI systems, source code, workflows, automations, dashboards, templates, designs, databases, integrations, and custom developments created by HIG AI AUTOMATION LLP shall remain the intellectual property of HIG AI AUTOMATION LLP unless otherwise agreed in writing.</li>
      <li>The Client shall not claim ownership of the proprietary framework, reusable modules, or AI automation architecture developed by HIG AI AUTOMATION LLP.</li>
      <li>Unauthorized copying, resale, sublicensing, or commercial redistribution is strictly prohibited.</li>
    </ol>
  </div>

  <div class="section">
    <h2>6. Non-Compete & Non-Circumvention</h2>
    <p>The Client agrees that during the project period and for a period of three (3) years after project completion:</p>
    <ol>
      <li>The Client shall not directly hire, poach, or engage employees, developers, consultants, or subcontractors of HIG AI AUTOMATION LLP without written consent.</li>
      <li>The Client shall not replicate or attempt to recreate the proprietary ERP or AI automation system using internal or third-party teams.</li>
    </ol>
  </div>

  <div class="section">
    <h2>7. Data Security</h2>
    <p>Both Parties agree to implement reasonable cybersecurity and data protection measures including: password protection, secure access control, data encryption where applicable, controlled server access, and backup and monitoring systems.</p>
  </div>

  <div class="section">
    <h2>8. Exclusions</h2>
    <p>Confidential Information does not include information that: is publicly available without breach of this Agreement, was already lawfully known before disclosure, is independently developed without use of confidential information, or is required to be disclosed by law or court order.</p>
  </div>

  <div class="section">
    <h2>9. Term of Agreement</h2>
    <p>This Agreement shall remain in effect for the duration of the project, and an additional 5 years after project completion or termination.</p>
  </div>

  <div class="section">
    <h2>10. Termination</h2>
    <p>Either Party may terminate this Agreement with written notice. Confidentiality obligations shall continue even after termination. Upon termination, the Client shall return or destroy confidential documents, remove unauthorized copies, and stop unauthorized use of proprietary systems.</p>
  </div>

  <div class="section">
    <h2>11. Breach & Legal Remedies</h2>
    <p>Any breach of this Agreement may result in immediate legal action, injunction relief, claim for damages, compensation for financial losses, or suspension of software/services.</p>
  </div>

  <div class="section">
    <h2>12. Governing Law</h2>
    <p>This Agreement shall be governed under the laws of India. Jurisdiction shall be under the courts of Tamil Nadu, India.</p>
  </div>

  <div class="section">
    <h2>13. Entire Agreement</h2>
    <p>This document represents the complete understanding between the Parties regarding confidentiality and supersedes any prior discussions or agreements.</p>
  </div>
  {{else}}
  
  {{#if isDigitalMarketing}}
  <div class="section">
    <h2>1. Purpose of Agreement</h2>
    <p>This Mutual Non-Disclosure Agreement ("Agreement") is entered into between <strong>{{companyName}}</strong> ("Agency") and <strong>{{clientName}}</strong> ("Client") to protect sensitive business, technical, and marketing information shared in connection with the digital marketing, ad optimization, content management, and brand growth campaign: <strong>{{projectName}}</strong>.</p>
  </div>

  <div class="section">
    <h2>2. Definition of Confidential Information</h2>
    <p>"Confidential Information" refers to any proprietary information disclosed by either party, including but not limited to:</p>
    <ul>
      <li>Social media account credentials, logins, admin tokens, passwords, and access protocols.</li>
      <li>Customer lead lists, email registers, phone numbers, and leads generated via digital promotional campaigns.</li>
      <li>Raw videography footage, unedited reel files, brand assets, aesthetic guides, and designs.</li>
      <li>Marketing calendars, content sheets, campaign ad configurations, and custom target audience structures.</li>
      <li>Financial strategies, pricing catalogs, business indicators, and metrics.</li>
    </ul>
  </div>

  <div class="section">
    <h2>3. Obligations of Confidentiality</h2>
    <p>The receiving Party agrees to: (a) keep the disclosing Party's Confidential Information strictly confidential; (b) use it solely for executing the marketing scope; and (c) restrict access to employees or representatives who have signed written obligations of confidentiality at least as restrictive as those contained herein. The Agency will implement secure, encrypted password-vault practices for all client-provided administrative social logins.</p>
  </div>

  <div class="section">
    <h2>4. Term and Returns</h2>
    <p>This Agreement and the obligations hereunder will remain in effect for a period of five (5) years from the Effective Date. Upon termination of the marketing project, the Agency agrees to securely delete and purge all client social login tokens, passwords, and administrative access records from its systems, unless otherwise mandated by legal compliance.</p>
  </div>
  {{/if}}

  {{#if isAiDevelopment}}
  <div class="section">
    <h2>1. Purpose of Agreement</h2>
    <p>This Mutual Non-Disclosure Agreement ("Agreement") is entered into between <strong>{{companyName}}</strong> ("Agency") and <strong>{{clientName}}</strong> ("Client") to protect proprietary neural net configurations, data training sets, algorithm specifications, and machine learning models shared in connection with the artificial intelligence development project: <strong>{{projectName}}</strong>.</p>
  </div>

  <div class="section">
    <h2>2. Definition of Confidential Information</h2>
    <p>"Confidential Information" refers to any proprietary information disclosed by either party, including but not limited to:</p>
    <ul>
      <li>Data training pipelines, neural network weights, hyperparameter sheets, and custom algorithms.</li>
      <li>Source datasets, curated labels, validation data matrices, and raw database exports used for training.</li>
      <li>ML model hosting configurations, REST API endpoints, API gateway keys, and inference performance logs.</li>
    </ul>
  </div>

  <div class="section">
    <h2>3. Obligations of Confidentiality</h2>
    <p>The receiving Party agrees to safeguard all training datasets and ML configurations. The Agency will implement strict sandboxed storage protocols to ensure training datasets are only processed on secure, encrypted computing environments.</p>
  </div>

  <div class="section">
    <h2>4. Term and Returns</h2>
    <p>This Agreement remains in effect for five (5) years. Upon project completion, all raw training datasets, customized weights libraries, and dataset duplicates will be securely destroyed or transferred to the Client's storage.</p>
  </div>
  {{/if}}

  {{/if}}

  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>HIG AI AUTOMATION LLP</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Signature</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>For: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Signature</p>
      <p>Date: ______________</p>
    </div>
  </div>
</div>
      `,
        },
        {
            name: 'Master Service Agreement (MSA)',
            category: 'PROJECT',
            contentHtml: documentStyles + `
<div class="contract-container">
  <div class="document-header">
    <div class="header-branding">
      <img src="/logo.png" alt="HIGAI Automation Logo" class="company-logo" onerror="this.style.display='none'" />
      <div class="company-details">
        <div class="company-name">HIGAI Automation LLP</div>
        <div class="company-meta">PPCQ+XH5, 6, S Bazaar, Palayamkottai</div>
        <div class="company-meta">Tirunelveli, Tamil Nadu 627002</div>
        <div class="company-meta">Phone: 63817 26852</div>
      </div>
    </div>
    <div class="divider"></div>
  </div>

  <div class="header-title-block">
    <h1>MASTER SERVICE AGREEMENT (MSA)</h1>
    <p>For ERP, AI Automation & Smart Factory Solutions</p>
    <p>Effective Date: {{startDate}}</p>
  </div>

  <div class="section">
    <p>This Master Service Agreement (“Agreement” or “MSA”) is entered into on <strong>{{startDate}}</strong>, by and between:</p>
    <p><strong>HIG AI AUTOMATION LLP</strong>, a company engaged in ERP Development, AI Automation, Smart Factory Solutions, IoT Integration, and Digital Transformation Services (hereinafter referred to as “Service Provider” or “HIG AI”)</p>
    <p>AND</p>
    <p><strong>{{clientName}}</strong> (hereinafter referred to as “Client”)</p>
    <p>Collectively referred to as the “Parties”.</p>
  </div>

  <div class="section">
    <h2>1. PURPOSE OF AGREEMENT</h2>
    <p>This Agreement establishes the general terms and conditions governing all services provided by HIG AI AUTOMATION LLP to the Client, including but not limited to:</p>
    <ul>
      {{#if moduleDetails.length}}
        {{#each moduleDetails}}
        <li><strong>{{this.name}}</strong>{{#if this.description}}: {{this.description}}{{/if}}</li>
        {{/each}}
      {{else}}
        <li>ERP Software Development</li>
        <li>AI Automation Solutions</li>
        <li>Smart Factory Systems</li>
        <li>Manufacturing Automation</li>
        <li>Inventory & Production Management</li>
        <li>QR Tracking Systems</li>
        <li>Cold Room Monitoring</li>
        <li>Billing & GST Systems</li>
        <li>WhatsApp Automation</li>
        <li>Dashboard & Analytics</li>
        <li>IoT Integrations</li>
        <li>AI Forecasting</li>
        <li>Mobile & Web Applications</li>
        <li>API Development</li>
        <li>Maintenance & Technical Support</li>
        <li>Cloud Deployment</li>
        <li>Custom Software Solutions</li>
      {{/if}}
    </ul>
    <p>Specific project details, timelines, deliverables, and pricing shall be defined in separate Work Orders, Quotations, Proposals, or Statements of Work (“SOW”).</p>
  </div>

  <div class="section">
    <h2>2. SCOPE OF SERVICES</h2>
    <p>HIG AI AUTOMATION LLP shall provide services including:</p>
    <h3>2.1 Software Development</h3>
    <ul>
      <li>ERP systems</li>
      <li>Web applications</li>
      <li>Mobile applications</li>
      <li>Admin dashboards</li>
      <li>AI-based systems</li>
    </ul>
    <h3>2.2 Automation Services</h3>
    <ul>
      <li>AI workflow automation</li>
      <li>WhatsApp automation</li>
      <li>Reporting automation</li>
      <li>Business process automation</li>
    </ul>
    <h3>2.3 Smart Factory & IoT</h3>
    <ul>
      <li>Production monitoring</li>
      <li>QR tracking</li>
      <li>Sensor integrations</li>
      <li>GPS tracking</li>
      <li>Predictive maintenance</li>
    </ul>
    <h3>2.4 Technical Support</h3>
    <ul>
      <li>Bug fixing</li>
      <li>Maintenance</li>
      <li>Server support</li>
      <li>Security updates</li>
      <li>System monitoring</li>
    </ul>
  </div>

  <div class="section">
    <h2>3. STATEMENT OF WORK (SOW)</h2>
    <p>Each project or service engagement may include a separate SOW containing:</p>
    <ul>
      <li>Project scope</li>
      <li>Deliverables</li>
      <li>Timeline</li>
      <li>Payment schedule</li>
      <li>Technical specifications</li>
      <li>Milestones</li>
      <li>User licenses</li>
      <li>Support duration</li>
    </ul>
    <p>In case of conflict, the SOW shall prevail over this MSA for that specific project.</p>
  </div>

  <div class="section">
    <h2>4. CLIENT RESPONSIBILITIES</h2>
    <p>The Client agrees to:</p>
    <ul>
      <li>Provide accurate project requirements and business information.</li>
      <li>Appoint a single point of contact for coordination.</li>
      <li>Provide timely approvals, feedback, and access required for project execution.</li>
      <li>Ensure legality of all data, content, and operational processes shared with HIG AI.</li>
      <li>Make payments as per agreed schedules.</li>
      <li>Maintain confidentiality of proprietary systems and software provided.</li>
    </ul>
  </div>

  <div class="section">
    <h2>5. PAYMENT TERMS</h2>
    <h3>5.1 Fees</h3>
    <p>The Client shall pay all fees as mentioned in the Proposal/SOW (Total Price: <strong>{{price}}</strong>).</p>
    <h3>5.2 Payment Schedule</h3>
    <p>Payments are structured based on project category, advances, and deliverables:</p>
    {{#if isWebProject}}
    <ul>
      <li><strong>25% Kickoff Advance</strong>: Invoiced immediately upon project creation, due before development begins.</li>
      <li><strong>25% Part 1 Milestone</strong>: Generated automatically once 33% of the target modules are completed on staging.</li>
      <li><strong>25% Part 2 Milestone</strong>: Generated automatically once 66% of the target modules are completed on staging.</li>
      <li><strong>25% Part 3 Milestone</strong>: Generated automatically once 100% of the target modules are completed and signed off.</li>
    </ul>
    {{/if}}
    {{#if isDigitalMarketing}}
    <ul>
      <li><strong>Monthly Management Charge</strong>: Fixed service charge of <strong>{{price}}</strong> per month, billed at the end of each calendar month.</li>
      <li><strong>Direct Ad Budget</strong>: Billed directly to the client's registered card on target ad networks.</li>
      <li><strong>Performance Trial Guarantee</strong>: Standard 3-month trial period applies.</li>
    </ul>
    {{/if}}
    {{#if isAutomation}}
    <ul>
      <li><strong>Upfront Setup Fee</strong>: 30% setup invoice due upon contract sign-off.</li>
      <li><strong>Final Invoicing</strong>: 70% billed upon successful script staging completion.</li>
    </ul>
    {{/if}}
    {{#if isAiDevelopment}}
    <ul>
      <li><strong>Training Start-up Fee</strong>: 40% invoiced at project launch.</li>
      <li><strong>Validation Milestone</strong>: 30% billed upon target validation metrics approval.</li>
      <li><strong>Inference Launch Milestone</strong>: 30% billed upon final REST API deployment.</li>
    </ul>
    {{/if}}
    <h3>5.3 Late Payments</h3>
    <p>Late payments beyond 7 days may attract: service suspension, additional late fees, or temporary access restrictions.</p>
    <h3>5.4 Taxes</h3>
    <p>Applicable GST and government taxes shall be paid by the Client.</p>
  </div>

  <div class="section">
    <h2>6. CHANGE REQUESTS</h2>
    <p>Any additional features, modifications, integrations, or scope changes requested after approval shall be treated as a Change Request and may involve: revised timelines, additional costs, and new deliverables. All changes must be approved in writing.</p>
  </div>

  <div class="section">
    <h2>7. INTELLECTUAL PROPERTY RIGHTS</h2>
    <h3>7.1 Ownership</h3>
    <p>Unless otherwise agreed in writing, all proprietary frameworks, AI engines, reusable modules, internal tools, automation systems, and backend architecture shall remain the intellectual property of HIG AI AUTOMATION LLP.</p>
    <h3>7.2 Client Rights</h3>
    <p>Upon full payment, the Client receives rights to use the delivered solution for internal business operations.</p>
    <h3>7.3 Restrictions</h3>
    <p>The Client shall not resell the software, reverse engineer the system, copy source code, replicate architecture, or share licensed systems with third parties without written approval.</p>
  </div>

  <div class="section">
    <h2>8. CONFIDENTIALITY</h2>
    <p>Both Parties agree to keep confidential all non-public information including: source code, financial information, business data, AI workflows, operational processes, customer databases, and technical documentation. Confidentiality obligations remain valid for 5 years after termination.</p>
  </div>

  <div class="section">
    <h2>9. DATA PROTECTION & SECURITY</h2>
    <p>HIG AI shall implement reasonable security measures including access controls, secure hosting, password protection, backup systems, and monitoring mechanisms. The Client is responsible for internal user access management, credential protection, and employee usage policies.</p>
  </div>

  <div class="section">
    <h2>10. WARRANTIES</h2>
    <p>HIG AI warrants that services will be performed professionally and deliverables will substantially match agreed specifications. However, HIG AI does not guarantee uninterrupted operation, error-free systems, or compatibility with unauthorized third-party systems.</p>
  </div>

  <div class="section">
    <h2>11. SUPPORT & MAINTENANCE</h2>
    <p>Support terms may include bug fixes, technical assistance, training support, basic server monitoring, and software updates. Support duration and AMC pricing shall be defined in the SOW.</p>
  </div>

  <div class="section">
    <h2>12. LIMITATION OF LIABILITY</h2>
    <p>HIG AI AUTOMATION LLP shall not be liable for indirect damages, business interruption, profit loss, data loss caused by third-party failures, or unauthorized user actions. Maximum liability shall not exceed the total amount paid by the Client for the affected project.</p>
  </div>

  <div class="section">
    <h2>13. FORCE MAJEURE</h2>
    <p>Neither Party shall be liable for delays or failures caused by events beyond reasonable control including natural disasters, internet outages, government restrictions, cyber incidents, power failures, or war/civil unrest.</p>
  </div>

  <div class="section">
    <h2>14. TERM & TERMINATION</h2>
    <h3>14.1 Term</h3>
    <p>This Agreement remains valid until terminated by either Party.</p>
    <h3>14.2 Termination</h3>
    <p>Either Party may terminate with 30 days written notice. Immediate termination may occur in cases of payment default, breach of confidentiality, illegal activity, or misuse of software/services.</p>
  </div>

  <div class="section">
    <h2>15. EFFECT OF TERMINATION</h2>
    <p>Upon termination, pending invoices become immediately payable, access to systems may be revoked, client data may be archived or deleted after notice, and confidentiality obligations continue.</p>
  </div>

  <div class="section">
    <h2>16. NON-SOLICITATION</h2>
    <p>The Client agrees not to directly hire or solicit employees, developers, consultants, or contractors of HIG AI AUTOMATION LLP during the agreement term and for 2 years thereafter.</p>
  </div>

  <div class="section">
    <h2>17. GOVERNING LAW & JURISDICTION</h2>
    <p>This Agreement shall be governed under the laws of India. Jurisdiction shall lie exclusively in the courts of Tamil Nadu, India.</p>
  </div>

  <div class="section">
    <h2>18. ENTIRE AGREEMENT</h2>
    <p>This MSA, together with any SOW, Proposal, Quotation, or Annexure, constitutes the complete agreement between the Parties.</p>
  </div>

  {{#if inclusions.length}}
  <div class="section">
    <h2>19. ADDITIONAL TERMS & PROJECT INCLUSIONS</h2>
    <ul>
      {{#each inclusions}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
  </div>
  {{/if}}

  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>HIG AI AUTOMATION LLP</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Signatory</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>For: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Signatory</p>
      <p>Date: ______________</p>
    </div>
  </div>
</div>
      `,
        },
        {
            name: 'Statement of Work (SOW)',
            category: 'PROJECT',
            contentHtml: documentStyles + `
<div class="contract-container">
  <div class="document-header">
    <div class="header-branding">
      <img src="/logo.png" alt="HIGAI Automation Logo" class="company-logo" onerror="this.style.display='none'" />
      <div class="company-details">
        <div class="company-name">HIGAI Automation LLP</div>
        <div class="company-meta">PPCQ+XH5, 6, S Bazaar, Palayamkottai</div>
        <div class="company-meta">Tirunelveli, Tamil Nadu 627002</div>
        <div class="company-meta">Phone: 63817 26852</div>
      </div>
    </div>
    <div class="divider"></div>
  </div>

  <div class="header-title-block">
    <h1>Statement of Work (SOW)</h1>
    <p>Project: {{projectName}} | Parent Agreement: MSA</p>
  </div>
  
  <div class="section">
    <h2>1. Executive Summary & Scope of Services</h2>
    {{#if isWebProject}}
    <p>This Statement of Work (SOW) details the deliverables, system components, modules, and software engineering workflows for project: <strong>{{projectName}}</strong>. The Agency shall design, develop, test, and deploy the following application components and modules:</p>
    <ul>
      {{#each moduleDetails}}
      <li><strong>{{this.name}}</strong> (Budget: {{this.price}}): {{this.description}}</li>
      {{/each}}
      <li><strong>Target Interactive Media Support</strong>: Provisioning for up to {{postCount}} image assets and {{videoCount}} video integrations embedded/optimized within the platform.</li>
    </ul>
    {{/if}}
    {{#if isDigitalMarketing}}
    <p>This Statement of Work (SOW) details the deliverables, campaigns, and creative workflows for project: <strong>{{projectName}}</strong>. The Agency shall execute the following recurring monthly campaign assets:</p>
    <ul>
      <li><strong>{{postCount}} Customized Brand Posters</strong>: Standard graphic designs delivered per month, highlighting offers, testimonials, and features.</li>
      <li><strong>{{videoCount}} Professionally Edited Reels / Short Videos</strong>: Engaging, trend-conscious, vertical video edits per month.</li>
      <li><strong>Special Day Holiday Promotion Posters</strong>: Complementary graphic assets delivered for every nationally recognized or industry-relevant special holiday falling in the calendar month.</li>
      <li><strong>2 Active Ad Campaigns</strong>: Run and optimized per month on Meta Platforms to acquire active, qualified leads.</li>
    </ul>
    {{/if}}
    {{#if isAutomation}}
    <p>This SOW details the automation workflows and API mappings to build for: <strong>{{projectName}}</strong>. The Agency shall build and test the following automation pipelines:</p>
    <ul>
      {{#each moduleDetails}}
      <li><strong>{{this.name}}</strong> (Price: {{this.price}}): {{this.description}}</li>
      {{/each}}
    </ul>
    {{/if}}
    {{#if isAiDevelopment}}
    <p>This SOW outlines the machine learning development tasks for: <strong>{{projectName}}</strong>. The Agency shall engineer, validate, and deliver the following models/pipelines:</p>
    <ul>
      {{#each moduleDetails}}
      <li><strong>{{this.name}}</strong> (Budget: {{this.price}}): {{this.description}}</li>
      {{/each}}
    </ul>
    {{/if}}
  </div>

  <div class="section">
    <h2>2. Production & Development Pipelines</h2>
    {{#if isWebProject}}
    <p>To maintain high development quality and timely feedback cycles, both parties agree to follow this planning and review schedule:</p>
    <ol>
      <li><strong>Architecture and Wireframe Delivery</strong>: The Agency will share the comprehensive project wireframes and database architecture schemas for client feedback prior to core engineering.</li>
      <li><strong>Revision & Approval Phase</strong>: Before code is locked, the Agency will accept layout and design feedback. The client agrees to complete review and provide approval within <strong>three (3) working days</strong>.</li>
      <li><strong>Code Freeze & Staging Deployment</strong>: Once a module is deployed to staging, the client has exactly <strong>three (3) days</strong> to test functionality and sign off on completion.</li>
    </ol>
    {{/if}}
    {{#if isDigitalMarketing}}
    <p>To maintain high consistency and optimal brand tone, both parties agree to follow this strict monthly planning schedule:</p>
    <ol>
      <li><strong>Content Calendar Delivery</strong>: The Agency will share the comprehensive content sheet for the upcoming month on the <strong>30th of the previous month</strong> to the Client for verification.</li>
      <li><strong>Revision & Approval Phase</strong>: Before the client approves, the Agency will accept feedback and change the content accordingly. The client agrees to complete the verification and provide final sign-off within <strong>two (2) days</strong> of receiving the sheet.</li>
      <li><strong>Content Freeze</strong>: Once the content sheet is approved by the Client, no further design plans or calendar revisions will be made for that month, ensuring the scheduling remains uninterrupted.</li>
      <li><strong>Respective Delivery Approval</strong>: Posters are scheduled for specific calendar days. To guarantee daily publications, individual poster files shared for daily review must be verified and approved by the Client within approximately <strong>three (3) hours</strong> of submission.</li>
    </ol>
    {{/if}}
    {{#if isAutomation}}
    <p>To ensure system stability, the following process is mandated:</p>
    <ol>
      <li><strong>Process Mapping (Flowcharts)</strong>: The Agency will deliver flowchart mappings of each automated workflow. The Client agrees to review and sign off within <strong>two (2) working days</strong>.</li>
      <li><strong>Sandbox Integration</strong>: Development occurs strictly in isolated test sandboxes. The Client must provide mockup accounts and test data for verification.</li>
      <li><strong>Production Sync</strong>: Live production sync and webhooks will be activated only after successful dry-runs on staging.</li>
    </ol>
    {{/if}}
    {{#if isAiDevelopment}}
    <p>To ensure machine learning model accuracy and transparency, the pipeline follows these steps:</p>
    <ol>
      <li><strong>Data Curation & Split</strong>: The Agency will report on dataset cleaning and split data into training, validation, and test segments.</li>
      <li><strong>Iteration Review</strong>: Model accuracy and loss curves will be updated weekly in training reports.</li>
      <li><strong>Threshold Validation</strong>: Prior to API buildout, the model must achieve accuracy/F1-score thresholds on validation matrices.</li>
    </ol>
    {{/if}}
  </div>

  {{#if inclusions.length}}
  <div class="section">
    <h2>3. ADDITIONAL TERMS & PROJECT INCLUSIONS</h2>
    <ul>
      {{#each inclusions}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
  </div>
  {{/if}}

  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Lead</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>For: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Representative</p>
      <p>Date: ______________</p>
    </div>
  </div>
</div>
      `,
        },
        {
            name: 'Service Level Agreement (SLA)',
            category: 'PROJECT',
            contentHtml: documentStyles + `
<div class="contract-container">
  <div class="document-header">
    <div class="header-branding">
      <img src="/logo.png" alt="HIGAI Automation Logo" class="company-logo" onerror="this.style.display='none'" />
      <div class="company-details">
        <div class="company-name">HIGAI Automation LLP</div>
        <div class="company-meta">PPCQ+XH5, 6, S Bazaar, Palayamkottai</div>
        <div class="company-meta">Tirunelveli, Tamil Nadu 627002</div>
        <div class="company-meta">Phone: 63817 26852</div>
      </div>
    </div>
    <div class="divider"></div>
  </div>

  <div class="header-title-block">
    <h1>Service Level Agreement (SLA)</h1>
    <p>Effective Date: {{startDate}} | Associated Project: {{projectName}}</p>
  </div>
  
  <div class="section">
    <h2>1. Response Times & Review SLAs</h2>
    <p>This SLA outlines critical turnaround and response rules. Compliance with these SLAs is mandatory to preserve the project timelines:</p>
    {{#if isWebProject}}
    <ul>
      <li><strong>Development Wireframe Review SLA</strong>: The Agency delivers architecture drafts and wireframes. The Client must provide feedback or sign-off within <strong>3 working days (72 Hours)</strong>.</li>
      <li><strong>Staging Module Review SLA</strong>: For finished staging modules, the Client agrees to test and approve or report functional bugs within <strong>3 working days (72 Hours)</strong>.</li>
      <li><strong>Server & Cloud Deployment Setup SLA</strong>: Setup, configuration of CI/CD pipeline, and staging environments shall be completed by the Agency within exactly <strong>2 days (48 Hours)</strong> from receiving full access keys.</li>
    </ul>
    {{/if}}
    {{#if isDigitalMarketing}}
    <ul>
      <li><strong>Monthly Content Calendar SLA</strong>: The Agency delivers the calendar sheet on the 30th of the previous month. The Client must provide review notes or approval within <strong>2 days (48 Hours)</strong>.</li>
      <li><strong>Daily Poster Approval SLA</strong>: For scheduled daily posters, the Client agrees to review and approve shared drafts within <strong>three (3) hours</strong> of delivery. Delay in approvals will push the release to the next peak high-traffic window.</li>
      <li><strong>New Meta Account Setup SLA</strong>: Setup, tracking configuration, and payment mapping for newly registered Meta Ads accounts shall be completed by the Agency within exactly <strong>2 days (48 Hours)</strong>.</li>
    </ul>
    {{/if}}
    {{#if isAutomation}}
    <ul>
      <li><strong>Process Mapping Review SLA</strong>: Client agrees to review and feedback on flowchart logic mappings within <strong>2 working days (48 Hours)</strong>.</li>
      <li><strong>Sandbox Test SLA</strong>: Staged automated runs will be evaluated and approved by the Client within <strong>2 working days</strong>.</li>
      <li><strong>API Access Setup SLA</strong>: Client provides all required system API keys within <strong>2 days</strong> of starting.</li>
    </ul>
    {{/if}}
    {{#if isAiDevelopment}}
    <ul>
      <li><strong>Data Quality Report SLA</strong>: Agency delivers dataset cleaning and preprocessing audits. Client must sign off within <strong>3 working days (72 Hours)</strong>.</li>
      <li><strong>Hyperparameter & Tuning Check SLA</strong>: Model validation metrics reports must be reviewed by the Client within <strong>3 working days</strong>.</li>
      <li><strong>Model Deployment SLA</strong>: Handover package and API endpoint integrations must be finalized by the Agency within <strong>5 working days</strong> from threshold approval.</li>
    </ul>
    {{/if}}
  </div>

  <div class="section">
    <h2>2. System Uptime & Execution Windows</h2>
    {{#if isWebProject}}
    <p>To maximize service availability and prevent runtime disruption:</p>
    <ul>
      <li><strong>Production Deployments</strong>: Scheduled exclusively during off-peak maintenance windows (11:00 PM - 3:00 AM) or over weekend periods.</li>
      <li><strong>Staging Environment Availability</strong>: Maintained at a minimum 99% availability rate during business hours (9:00 AM - 6:00 PM) to facilitate active client testing.</li>
    </ul>
    {{/if}}
    {{#if isDigitalMarketing}}
    <p>To maximize engagement, publishing occurs strictly in certified high-traffic slots. The active windows are scheduled based on platform data:</p>
    <ul>
      <li><strong>Primary Peak Slots (High-Traffic)</strong>: Noon slot (12:00 PM - 2:00 PM) and Evening slot (6:30 PM - 9:00 PM).</li>
      <li><strong>Off-Peak Standard</strong>: No assets will be published during off-peak times. If approvals are delayed by the client, publishing will automatically be rescheduled to the next day's primary peak slot.</li>
    </ul>
    {{/if}}
    {{#if isAutomation}}
    <p>To prevent execution loops or platform blockages, the automated scripts follow strict windows:</p>
    <ul>
      <li><strong>Batch Cron Execution Windows</strong>: Hourly batch synchronizations are run on weekdays between 8:00 AM and 8:00 PM.</li>
      <li><strong>Webhooks Uptime</strong>: Real-time API webhook endpoints are kept active with a targeted 99.9% runtime uptime commitment.</li>
    </ul>
    {{/if}}
    {{#if isAiDevelopment}}
    <p>To optimize computing power and prevent model latency:</p>
    <ul>
      <li><strong>GPU Training Cycles</strong>: Model training iterations are scheduled primarily overnight (10:00 PM - 6:00 AM) to optimize server pricing.</li>
      <li><strong>Inference API Response SLA</strong>: Model REST API endpoints must deliver responses within <strong>500 milliseconds</strong> on target datasets.</li>
    </ul>
    {{/if}}
  </div>

  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Operations Lead</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>For: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Client Liaison</p>
      <p>Date: ______________</p>
    </div>
  </div>
</div>
      `,
        },
        {
            name: 'Project Proposal',
            category: 'PROJECT',
            contentHtml: documentStyles + `
<div class="contract-container">
  <div class="document-header">
    <div class="header-branding">
      <img src="/logo.png" alt="HIGAI Automation Logo" class="company-logo" onerror="this.style.display='none'" />
      <div class="company-details">
        <div class="company-name">HIGAI Automation LLP</div>
        <div class="company-meta">PPCQ+XH5, 6, S Bazaar, Palayamkottai</div>
        <div class="company-meta">Tirunelveli, Tamil Nadu 627002</div>
        <div class="company-meta">Phone: 63817 26852</div>
      </div>
    </div>
    <div class="divider"></div>
  </div>

  <div class="header-title-block">
    {{#if isWebProject}}
    <h1>Custom Software Development Proposal</h1>
    {{/if}}
    {{#if isDigitalMarketing}}
    <h1>Digital Marketing Strategy Proposal</h1>
    {{/if}}
    {{#if isAutomation}}
    <h1>Business Workflow Automation Proposal</h1>
    {{/if}}
    {{#if isAiDevelopment}}
    <h1>Artificial Intelligence & ML Proposal</h1>
    {{/if}}
    <p>Prepared for: {{clientName}} | Associated Project: {{projectName}}</p>
  </div>
  
  <div class="section">
    <h2>1. Project Objective</h2>
    {{#if isWebProject}}
    <p>To design, develop, test, and deploy a custom software system for <strong>{{clientName}}</strong>. By engineering modular system components, database schemas, and optimized user interfaces, the Agency will establish a high-performance system for the client's operations: <strong>{{projectName}}</strong>.</p>
    {{/if}}
    {{#if isDigitalMarketing}}
    <p>To execute a premium brand promotion and active lead-generation campaign for <strong>{{clientName}}</strong>. By developing high-impact vertical videos, modern poster designs, and optimizing target-oriented Meta ad campaigns, the Agency will establish digital authority and acquire customer leads for the client's business: <strong>{{projectName}}</strong>.</p>
    {{/if}}
    {{#if isAutomation}}
    <p>To design, test, script, and launch automated system flows and API connectors for <strong>{{clientName}}</strong>. By streamlining data synchronizations and workflow triggers, the Agency will eliminate manual tasks for: <strong>{{projectName}}</strong>.</p>
    {{/if}}
    {{#if isAiDevelopment}}
    <p>To analyze, train, validate, and deploy customized artificial intelligence models and pipelines for <strong>{{clientName}}</strong>. By fine-tuning algorithms on client data, the Agency will build intelligent tools for: <strong>{{projectName}}</strong>.</p>
    {{/if}}
  </div>

  <div class="section">
    <h2>2. Project Deliverables & Modules</h2>
    {{#if isWebProject}}
    <p>The engineering roadmap encompasses the following system modules and tools:</p>
    <ul>
      {{#each moduleDetails}}
      <li><strong>{{this.name}}</strong> (Price: {{this.price}}): {{this.description}}</li>
      {{/each}}
      <li><strong>Media & Interactive Elements</strong>: Supporting up to {{postCount}} image assets and {{videoCount}} video integrations.</li>
    </ul>
    {{/if}}
    {{#if isDigitalMarketing}}
    <p>The package contains the following high-value assets and execution strategies:</p>
    <ul>
      <li><strong>Organic Branding</strong>: {{postCount}} customized graphic posters + {{videoCount}} custom-edited vertical reels per month.</li>
      <li><strong>Holiday Reach</strong>: Promo graphics for every calendar special day and holiday.</li>
      <li><strong>Paid Leads</strong>: Setup and optimization of two (2) targeted ad campaigns per month on Instagram & Facebook.</li>
      <li><strong>Peak Hour Publishing</strong>: All postings scheduled during high-traffic times to maximize viral reach.</li>
    </ul>
    {{/if}}
    {{#if isAutomation}}
    <p>The automation roadmap covers the following process integrations:</p>
    <ul>
      {{#each moduleDetails}}
      <li><strong>{{this.name}}</strong> (Price: {{this.price}}): {{this.description}}</li>
      {{/each}}
    </ul>
    {{/if}}
    {{#if isAiDevelopment}}
    <p>The model training roadmap includes the following components:</p>
    <ul>
      {{#each moduleDetails}}
      <li><strong>{{this.name}}</strong> (Price: {{this.price}}): {{this.description}}</li>
      {{/each}}
    </ul>
    {{/if}}
  </div>

  <div class="section">
    <h2>3. Commercial Commitment & Payment Milestones</h2>
    {{#if isWebProject}}
    <ul>
      <li><strong>Total Development Price</strong>: Fixed contract charge of <strong>{{price}}</strong>.</li>
      <li><strong>Kickoff Advance Payment</strong>: A 25% kickoff invoice is issued automatically upon project start.</li>
      <li><strong>Milestone Billing Cycles</strong>: Additional payments (three parts of 25% each) are billed dynamically when module completion reaches 33%, 66%, and 100%.</li>
    </ul>
    {{/if}}
    {{#if isDigitalMarketing}}
    <ul>
      <li><strong>Monthly Management Charge</strong>: Fixed service charge of <strong>{{price}}</strong> per month, billed at the month-end.</li>
      <li><strong>Direct Ad Spend</strong>: Directed based on client opinion, billed directly to the client's credit card.</li>
      <li><strong>Performance Trial Guarantee</strong>: A 3-month trial period is offered. If zero leads are generated by the 3rd month, the contract can be terminated immediately with no ongoing commitment.</li>
    </ul>
    {{/if}}
    {{#if isAutomation}}
    <ul>
      <li><strong>Total Automation Price</strong>: Flat project charge of <strong>{{price}}</strong>.</li>
      <li><strong>Upfront Setup Fee</strong>: 30% setup invoice due upon agreement execution.</li>
      <li><strong>Final Invoicing</strong>: 70% billed upon successful script staging completion.</li>
    </ul>
    {{/if}}
    {{#if isAiDevelopment}}
    <ul>
      <li><strong>Model Engineering Price</strong>: Flat contract charge of <strong>{{price}}</strong>.</li>
      <li><strong>Training Start-up Fee</strong>: 40% invoiced at project start.</li>
      <li><strong>Validation Milestone</strong>: 30% billed upon target validation metrics approval.</li>
      <li><strong>Inference Launch Milestone</strong>: 30% billed upon final REST API deployment.</li>
    </ul>
    {{/if}}
  </div>

  <div class="signatures">
    <div class="sig-col">
      <p>Prepared by: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Tech Director / Partner</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>Accepted by: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Representative</p>
      <p>Date: ______________</p>
    </div>
  </div>
</div>
      `,
        },
        {
            name: 'Intellectual Property Agreement',
            category: 'PROJECT',
            contentHtml: documentStyles + `
<div class="contract-container">
  <div class="document-header">
    <div class="header-branding">
      <img src="/logo.png" alt="HIGAI Automation Logo" class="company-logo" onerror="this.style.display='none'" />
      <div class="company-details">
        <div class="company-name">HIGAI Automation LLP</div>
        <div class="company-meta">PPCQ+XH5, 6, S Bazaar, Palayamkottai</div>
        <div class="company-meta">Tirunelveli, Tamil Nadu 627002</div>
        <div class="company-meta">Phone: 63817 26852</div>
      </div>
    </div>
    <div class="divider"></div>
  </div>

  <div class="header-title-block">
    <h1>Intellectual Property Rights Agreement</h1>
    <p>Associated Project: {{projectName}} | Effective Date: {{startDate}}</p>
  </div>
  
  <div class="section">
    <h2>1. Ownership of Deliverables and Source Code</h2>
    {{#if isWebProject}}
    <p>All source code, database structures, application architectures, binary files, custom modules, and design assets developed specifically for <strong>{{projectName}}</strong> will belong to <strong>{{clientName}}</strong>. The transfer of copyright and intellectual property rights for the software takes place <strong>only upon receipt of all scheduled milestone payments totaling {{price}}</strong>.</p>
    {{/if}}
    {{#if isDigitalMarketing}}
    <p>All finished promotional posters ({{postCount}} per month), custom reels ({{videoCount}} per month), special day graphics, and custom campaign ad structures created specifically for <strong>{{projectName}}</strong> will belong to <strong>{{clientName}}</strong>. The transfer of copyright and intellectual property rights for each month's creative assets takes place <strong>only upon receipt of the monthly service fee of {{price}} at the month-end</strong>.</p>
    {{/if}}
    {{#if isAutomation}}
    <p>All process automation scripts, integration logic, cron setups, and configuration settings engineered specifically for <strong>{{projectName}}</strong> will belong to <strong>{{clientName}}</strong>. Intellectual property transfer is completed <strong>only upon receipt of the final project fee of {{price}}</strong>.</p>
    {{/if}}
    {{#if isAiDevelopment}}
    <p>All customized model structures, model weight files, pre-processing python scripts, and custom training configs developed specifically for <strong>{{projectName}}</strong> will belong to <strong>{{clientName}}</strong>. The transfer of IP and copyright takes place <strong>only upon receipt of all accuracy and deployment milestones totaling {{price}}</strong>.</p>
    {{/if}}
  </div>

  <div class="section">
    <h2>2. Access and Cloud Infrastructure Ownership</h2>
    {{#if isWebProject}}
    <p>All staging environments, domain names, cloud server subscriptions, and database endpoints purchased/setup using the Client's accounts will remain the sole, exclusive property of the Client.</p>
    {{/if}}
    {{#if isDigitalMarketing}}
    <p>All login permissions, admin authorizations, and user accesses to the requested social media accounts provided by the Client will remain the sole, exclusive property of the Client.</p>
    {{/if}}
    {{#if isAutomation}}
    <p>All configured system logins, API dashboards, and webhooks initialized on the Client's corporate SaaS environments remain the exclusive property of the Client.</p>
    {{/if}}
    {{#if isAiDevelopment}}
    <p>All cloud GPU server instances, data directories, model hosting endpoints, and training cloud accounts created or funded by the Client remain the exclusive property of the Client.</p>
    {{/if}}
  </div>

  <div class="section">
    <h2>3. Pre-Existing Agency Code & Frameworks</h2>
    {{#if isWebProject}}
    <p>The Agency retains full ownership and intellectual rights over its pre-existing library functions, core templates, backend boilerplates, or generic components used in development. The Client is granted a non-exclusive, perpetual, royalty-free license to use and modify these pre-existing items as part of the compiled software system.</p>
    {{/if}}
    {{#if isDigitalMarketing}}
    <p>The Agency retains full ownership and intellectual rights over its core pre-existing assets, design source files, master Photoshop/Illustrator layout templates, editing presets, stock footage licenses, and proprietary strategies.</p>
    {{/if}}
    {{#if isAutomation}}
    <p>The Agency retains full ownership of its custom utility functions, script builders, and reusable cron runners, granting the Client a perpetual license to execute these utilities within their business.</p>
    {{/if}}
    {{#if isAiDevelopment}}
    <p>The Agency retains ownership over its pre-existing neural architectures, model evaluation tools, and data curation utilities, granting the Client a perpetual license to use these libraries inside their deployed model.</p>
    {{/if}}
  </div>

  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Tech / Creative Assignor</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>For: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Intellectual Assignee</p>
      <p>Date: ______________</p>
    </div>
  </div>
</div>
      `,
        },
        {
            name: 'Data Processing Agreement (DPA)',
            category: 'PROJECT',
            contentHtml: documentStyles + `
<div class="contract-container">
  <div class="document-header">
    <div class="header-branding">
      <img src="/logo.png" alt="HIGAI Automation Logo" class="company-logo" onerror="this.style.display='none'" />
      <div class="company-details">
        <div class="company-name">HIGAI Automation LLP</div>
        <div class="company-meta">PPCQ+XH5, 6, S Bazaar, Palayamkottai</div>
        <div class="company-meta">Tirunelveli, Tamil Nadu 627002</div>
        <div class="company-meta">Phone: 63817 26852</div>
      </div>
    </div>
    <div class="divider"></div>
  </div>

  <div class="header-title-block">
    <h1>Data Processing Addendum (DPA)</h1>
    <p>Effective Date: {{startDate}} | Associated Project: {{projectName}}</p>
  </div>
  
  <div class="section">
    <h2>1. Scope and Processing Roles</h2>
    {{#if isWebProject}}
    <p>This Data Processing Addendum regulates the secure processing of personal database records, user accounts, and system transactions for the software engineering project <strong>{{projectName}}</strong>. Under applicable privacy laws, <strong>{{clientName}}</strong> is the Data Controller, and <strong>{{companyName}}</strong> is the Data Processor.</p>
    {{/if}}
    {{#if isDigitalMarketing}}
    <p>This Data Processing Addendum regulates the secure handling and retrieval of personal data in connection with the campaign <strong>{{projectName}}</strong>. During the course of running two (2) targeted ad campaigns per month, the Agency will collect customer leads on behalf of the Client. Under applicable privacy laws, <strong>{{clientName}}</strong> is the Data Controller, and <strong>{{companyName}}</strong> is the Data Processor.</p>
    {{/if}}
    {{#if isAutomation}}
    <p>This Data Processing Addendum regulates the automated data syncs and workflow processes engineered for the project: <strong>{{projectName}}</strong>. The Agency acts as the Data Processor, automating flows on behalf of <strong>{{clientName}}</strong> (Data Controller).</p>
    {{/if}}
    {{#if isAiDevelopment}}
    <p>This Data Processing Addendum regulates the secure handling of training datasets containing personal records for: <strong>{{projectName}}</strong>. The Client acts as the Data Controller, and the Agency acts as the Data Processor processing data for training models.</p>
    {{/if}}
  </div>

  <div class="section">
    <h2>2. Categories of Processed Data</h2>
    {{#if isWebProject}}
    <p>Processing covers database tables, user registrations, application logs, and payment payloads collected by the custom platform. This includes: Customer profiles, login records, email IDs, hashed passwords, transaction logs, and billing details.</p>
    {{/if}}
    {{#if isDigitalMarketing}}
    <p>Processing will strictly cover standard customer leads generated through Meta Lead-Generation Forms and landing pages. This includes: Customer names, telephone numbers, emails, physical location details, and service inquiry options.</p>
    {{/if}}
    {{#if isAutomation}}
    <p>Processing covers SaaS application payloads, employee profiles, customer records, and invoice lists synced between target platforms.</p>
    {{/if}}
    {{#if isAiDevelopment}}
    <p>Processing covers clean datasets, text corpora, transaction lists, user demographic attributes, and test records processed during training.</p>
    {{/if}}
  </div>

  <div class="section">
    <h2>3. Data Protection & Security Measures</h2>
    {{#if isWebProject}}
    <p>The Processor (Agency) agrees to: (a) process database and transaction records solely to develop, host, and maintain the custom application; (b) restrict server SSH and administrative backend credentials to authorized development staff; and (c) implement SSL encryption, database hashing, and firewall rules to protect user records from data breaches.</p>
    {{/if}}
    {{#if isDigitalMarketing}}
    <p>The Processor (Agency) agrees to: (a) process leads data solely to deliver, download, and sync them to the Controller's verified database or CRM; (b) restrict internal lead access to campaign managers; and (c) never sell, share, or store leads data for any third-party marketing purposes. The Processor will maintain robust access controls to prevent data breaches.</p>
    {{/if}}
    {{#if isAutomation}}
    <p>The Processor (Agency) will: (a) encrypt all workflow payloads in transit; (b) restrict API token exposures; and (c) store flow credentials in isolated key vaults.</p>
    {{/if}}
    {{#if isAiDevelopment}}
    <p>The Processor (Agency) will: (a) train models exclusively on sandboxed secure servers; (b) anonymize or de-identify personal records in dataset samples; and (c) securely purge raw training files upon model sign-off.</p>
    {{/if}}
  </div>

  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Data Privacy Officer</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>For: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Chief Information Officer</p>
      <p>Date: ______________</p>
    </div>
  </div>
</div>
      `,
        },
        {
            name: 'Sales Quotation',
            category: 'SALES',
            contentHtml: '<h1>Sales Quotation</h1><p>Prepared for {{clientName}}</p><p>Package: {{packageName}}</p><p>Base Price: ${{basePrice}}</p><p>Valid Until: {{validUntil}}</p>',
        },
        {
            name: 'Employment Agreement',
            category: 'HR',
            contentHtml: documentStyles + `
<div class="contract-container">
  <div class="header">
    <h1>Employment Agreement</h1>
    <p>Effective Date: {{joiningDate}}</p>
  </div>
  <div class="section">
    <h2>1. Parties and Designation</h2>
    <p>This Employment Agreement is entered into by and between <strong>{{companyName}}</strong> and <strong>{{firstName}} {{lastName}}</strong>. The Employee is hired in the capacity of <strong>{{designation}}</strong>.</p>
  </div>
  <div class="section">
    <h2>2. Compensation and Benefits</h2>
    <p>The Employee shall receive a monthly salary basis of <strong>\${{salaryBasis}}</strong>, subject to applicable tax withholdings and deductions. Standard company benefits apply.</p>
  </div>
  <div class="section">
    <h2>3. Term and Termination</h2>
    <p>This employment is at-will. Either party may terminate this agreement at any time with or without cause by giving standard notice.</p>
  </div>
  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Signatory</p>
    </div>
    <div class="sig-col">
      <p>Employee: <strong>{{firstName}} {{lastName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Signature</p>
    </div>
  </div>
</div>
      `,
        },
        {
            name: 'Closing Agreement',
            category: 'HR',
            contentHtml: documentStyles + `
<div class="contract-container">
  <div class="header">
    <h1>Relieving & Experience Letter</h1>
    <p>Relieving Date: {{relievingDate}}</p>
  </div>
  <div class="section">
    <h2>To Whom It May Concern</h2>
    <p>This is to certify that <strong>{{firstName}} {{lastName}}</strong> was employed with <strong>{{companyName}}</strong> as a <strong>{{designation}}</strong> from <strong>{{joiningDate}}</strong> to <strong>{{relievingDate}}</strong>.</p>
    <p>During their tenure, we found them to be diligent, honest, and dedicated. All corporate assets have been returned, and all dues have been cleared. We wish them success in their future endeavors.</p>
  </div>
  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized HR Signatory</p>
    </div>
  </div>
</div>
      `,
        },
        {
            name: 'Employee Payslip',
            category: 'HR',
            contentHtml: documentStyles + `
<div class="contract-container">
  <div class="header">
    <h1>Salary Payslip</h1>
    <p>Month: {{month}}</p>
  </div>
  <div class="section">
    <h2>Employee Details</h2>
    <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 6px 0; font-weight: bold; width: 30%;">Employee Name:</td>
        <td style="padding: 6px 0;">{{firstName}} {{lastName}}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: bold;">Designation:</td>
        <td style="padding: 6px 0;">{{designation}}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: bold;">Email:</td>
        <td style="padding: 6px 0;">{{email}}</td>
      </tr>
    </table>
  </div>
  <div class="section">
    <h2>Earnings & Deductions</h2>
    <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse; border: 1px solid #e2e8f0;">
      <thead>
        <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <th style="padding: 8px; text-align: left; font-weight: bold; width: 35%;">Earnings Description</th>
          <th style="padding: 8px; text-align: right; font-weight: bold; width: 15%;">Amount</th>
          <th style="padding: 8px; text-align: left; font-weight: bold; width: 35%;">Deductions Description</th>
          <th style="padding: 8px; text-align: right; font-weight: bold; width: 15%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">Basic Salary</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f1f5f9;">\${{basicSalary}}</td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">PF Deduction</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f1f5f9;">\${{pf}}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">Bonus</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f1f5f9;">\${{bonus}}</td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">ESI Deduction</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f1f5f9;">\${{esi}}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">Incentive</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f1f5f9;">\${{incentive}}</td>
          <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">Other Deductions</td>
          <td style="padding: 8px; text-align: right; border-bottom: 1px solid #f1f5f9;">\${{otherDeductions}}</td>
        </tr>
        <tr style="font-weight: bold; background: #f8fafc; border-top: 1px solid #e2e8f0;">
          <td style="padding: 8px;">Gross Earnings</td>
          <td style="padding: 8px; text-align: right;">\${{grossEarnings}}</td>
          <td style="padding: 8px;">Total Deductions</td>
          <td style="padding: 8px; text-align: right;">\${{totalDeductions}}</td>
        </tr>
        <tr style="font-weight: bold; background: #e0f2fe; border-top: 2px solid #0284c7;">
          <td style="padding: 8px;" colspan="3">Net Salary Credited</td>
          <td style="padding: 8px; text-align: right;">\${{netSalary}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
      `,
        },
    ];
    for (const t of templates) {
        await prisma.documentTemplate.upsert({
            where: { id: t.name + tenantId, tenantId, name: t.name },
            update: { contentHtml: t.contentHtml },
            create: {
                tenantId,
                name: t.name,
                category: t.category,
                contentHtml: t.contentHtml,
            },
        });
    }
    console.log('Seed templates created successfully!');
    const packages = [
        {
            name: 'AI Starter Pack',
            basePrice: 1500,
            tiers: [
                { name: 'Monthly', price: 150 },
                { name: 'Annual', price: 1500 },
            ]
        },
        {
            name: 'Enterprise AI Automation',
            basePrice: 5000,
            tiers: [
                { name: 'Monthly', price: 500 },
                { name: 'Annual', price: 5000 },
            ]
        }
    ];
    for (const p of packages) {
        await prisma.package.upsert({
            where: { id: p.name + tenantId, tenantId, name: p.name },
            update: {},
            create: {
                tenantId,
                name: p.name,
                basePrice: p.basePrice,
                tiers: {
                    create: p.tiers
                }
            }
        });
    }
    console.log('Sample packages seeded!');
}
main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=seed-templates.js.map