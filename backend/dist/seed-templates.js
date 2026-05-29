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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
  
  .contract-container {
    font-family: 'Inter', sans-serif;
    color: #1e293b;
    line-height: 1.7;
    max-width: 800px;
    margin: 0 auto;
    padding: 30px;
    background: #ffffff;
  }
  
  .header {
    text-align: center;
    margin-bottom: 40px;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 24px;
  }
  
  .header h1 {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    margin: 0 0 8px 0;
    letter-spacing: 0.5px;
  }
  
  .header p {
    font-size: 13px;
    font-style: italic;
    color: #64748b;
    margin: 0;
  }
  
  .section {
    margin-bottom: 30px;
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
  
  .section p, .section ol, .section ul {
    font-size: 13px;
    color: #334155;
    margin-top: 0;
    text-align: justify;
  }

  .section ol, .section ul {
    padding-left: 20px;
  }

  .section li {
    margin-bottom: 8px;
  }
  
  .signatures {
    margin-top: 50px;
    display: flex;
    justify-content: space-between;
    page-break-inside: avoid;
    gap: 40px;
  }
  
  .sig-col {
    width: 48%;
    font-size: 12px;
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
  <div class="header">
    <h1>Mutual Non-Disclosure Agreement</h1>
    <p>Effective Date: {{startDate}}</p>
  </div>
  <div class="section">
    <h2>1. Parties and Purpose</h2>
    <p>This Mutual Non-Disclosure Agreement ("Agreement") is entered into by and between <strong>{{companyName}}</strong> and <strong>{{clientName}}</strong> (each a "Party", and collectively the "Parties") in connection with the evaluation of a potential business relationship concerning project: <strong>{{projectName}}</strong> (the "Purpose").</p>
  </div>
  <div class="section">
    <h2>2. Confidential Information</h2>
    <p>"Confidential Information" refers to any proprietary, non-public data, trade secrets, software code, AI model designs, financial statements, or commercial strategies disclosed by one party to the other, whether marked confidential or not.</p>
  </div>
  <div class="section">
    <h2>3. Obligations of Confidentiality</h2>
    <p>The receiving Party agrees to: (a) keep the disclosing Party's Confidential Information strictly confidential; (b) use it solely for the Purpose; and (c) restrict access to employees or representatives who have signed written obligations of confidentiality at least as restrictive as those contained herein.</p>
  </div>
  <div class="section">
    <h2>4. Term and Governing Law</h2>
    <p>This Agreement and the obligations hereunder will remain in effect for a period of five (5) years from the Effective Date. This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction of incorporation of the disclosing party.</p>
  </div>
  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
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
  <div class="header">
    <h1>Master Service Agreement</h1>
    <p>Effective Date: {{startDate}}</p>
  </div>
  <div class="section">
    <h2>1. Scope of Services</h2>
    <p>This Master Service Agreement ("Agreement") establishes the terms under which <strong>{{companyName}}</strong> will perform AI development, consulting, and automation services for <strong>{{clientName}}</strong>. Individual projects will be executed under separate Statements of Work (SOWs).</p>
  </div>
  <div class="section">
    <h2>2. Fees and Payments</h2>
    <p>The Client shall pay {{companyName}} the fees specified in each applicable SOW. Payments are due within thirty (30) days of the invoice date. Late payments may accrue interest at a rate of 1.5% per month.</p>
  </div>
  <div class="section">
    <h2>3. Warranty and Indemnity</h2>
    <p>{{companyName}} warrants that all services will be performed in a professional manner in accordance with industry standards. Except as explicitly stated, all deliverables are provided "as-is" without warranty of any kind.</p>
  </div>
  <div class="section">
    <h2>4. Dispute Resolution</h2>
    <p>Any dispute arising out of this Agreement shall be resolved through binding arbitration in accordance with standard arbitration rules before recourse to courts.</p>
  </div>
  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
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
            name: 'Statement of Work (SOW)',
            category: 'PROJECT',
            contentHtml: documentStyles + `
<div class="contract-container">
  <div class="header">
    <h1>Statement of Work (SOW)</h1>
    <p>Project: {{projectName}} | Date: {{startDate}}</p>
  </div>
  <div class="section">
    <h2>1. Executive Summary</h2>
    <p>This SOW is issued pursuant to the MSA between <strong>{{companyName}}</strong> and <strong>{{clientName}}</strong>. It defines the specific objectives, milestones, and payment schedule for project: <strong>{{projectName}}</strong>.</p>
  </div>
  <div class="section">
    <h2>2. Deliverables and Timeline</h2>
    <ol>
      <li><strong>Milestone 1: Architectural Draft</strong> - System diagram, database schema, and API specifications. (Target: 4 weeks)</li>
      <li><strong>Milestone 2: Core AI Engines</strong> - LLM fine-tuning pipelines, orchestration agents, and retrieval gateways. (Target: 8 weeks)</li>
      <li><strong>Milestone 3: Dashboard & Staging</strong> - Responsive telemetry workspace integration and staging rollout. (Target: 12 weeks)</li>
    </ol>
  </div>
  <div class="section">
    <h2>3. Payment Schedule</h2>
    <p>Invoicing will be triggered upon the successful delivery of each Milestone. Payment for Milestone 1 is 30% of total contract value, Milestone 2 is 40%, and Milestone 3 is 30%.</p>
  </div>
  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
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
            name: 'Service Level Agreement (SLA)',
            category: 'PROJECT',
            contentHtml: documentStyles + `
<div class="contract-container">
  <div class="header">
    <h1>Service Level Agreement (SLA)</h1>
    <p>Effective Date: {{startDate}}</p>
  </div>
  <div class="section">
    <h2>1. Service Scope and Uptime</h2>
    <p>This SLA outlines the support parameters and system uptime guarantees provided by <strong>{{companyName}}</strong> to <strong>{{clientName}}</strong> for the production deployment of project: <strong>{{projectName}}</strong>. We guarantee a 99.9% monthly uptime ratio, excluding scheduled maintenance windows.</p>
  </div>
  <div class="section">
    <h2>2. Support Severity and Response SLA</h2>
    <ul>
      <li><strong>Severity 1 (Critical)</strong>: Core system down, operations halted. Response: &lt; 1 Hour. Resolution: &lt; 4 Hours.</li>
      <li><strong>Severity 2 (High)</strong>: Major functionality disabled, operations degraded. Response: &lt; 4 Hours. Resolution: &lt; 24 Hours.</li>
      <li><strong>Severity 3 (Medium/Low)</strong>: Minor issues, feature requests. Response: &lt; 24 Hours. Resolution: Next Scheduled Release.</li>
    </ul>
  </div>
  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Service Director</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>For: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">IT Operations Director</p>
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
  <div class="header">
    <h1>Enterprise AI Solution Proposal</h1>
    <p>Prepared for: {{clientName}} | Project: {{projectName}}</p>
  </div>
  <div class="section">
    <h2>1. Objective</h2>
    <p>To design and implement a bespoke cognitive retrieval framework and workflow pipeline for <strong>{{clientName}}</strong> to automate internal operations, reduce compliance friction, and streamline delivery for project: <strong>{{projectName}}</strong>.</p>
  </div>
  <div class="section">
    <h2>2. Proposed Architecture</h2>
    <p>We propose a decoupled Next.js & NestJS framework featuring a pgvector-enabled PostgreSQL engine. This guarantees responsive vector searches, secure JWT-based access controls, and dynamic real-time telemetry panels.</p>
  </div>
  <div class="section">
    <h2>3. Commercial Quote</h2>
    <p>The estimated investment for the implementation of the proposed AI Suite is outlined in the SOW. Maintenance and continuous model validation are estimated at $2,500/month after rollout.</p>
  </div>
  <div class="signatures">
    <div class="sig-col">
      <p>Prepared by: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Lead AI Architect</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>Accepted by: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Signatory</p>
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
  <div class="header">
    <h1>Intellectual Property Rights Agreement</h1>
    <p>Date: {{startDate}}</p>
  </div>
  <div class="section">
    <h2>1. Ownership of Deliverables</h2>
    <p>Upon final settlement of all invoices due under the SOW, <strong>{{companyName}}</strong> hereby assigns to <strong>{{clientName}}</strong> all right, title, and interest in the software code, database schemas, custom model parameters, and assets created specifically for project: <strong>{{projectName}}</strong>.</p>
  </div>
  <div class="section">
    <h2>2. Background IP Retained</h2>
    <p>Notwithstanding Section 1, {{companyName}} retains all rights, titles, and interests in its pre-existing components, core utility scripts, and generic AI prompt orchestration libraries. The Client is granted a non-exclusive, worldwide, royalty-free, perpetual license to use such background IP as embedded in the final deliverables.</p>
  </div>
  <div class="signatures">
    <div class="sig-col">
      <p>Assignor: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Signature</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>Assignee: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Authorized Signature</p>
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
  <div class="header">
    <h1>Data Processing Addendum (DPA)</h1>
    <p>Effective Date: {{startDate}}</p>
  </div>
  <div class="section">
    <h2>1. Scope and Compliance</h2>
    <p>This DPA is entered into by <strong>{{companyName}}</strong> (acting as the "Processor") and <strong>{{clientName}}</strong> (acting as the "Controller") to regulate the handling of personal data in compliance with GDPR and relevant data privacy laws during the execution of project: <strong>{{projectName}}</strong>.</p>
  </div>
  <div class="section">
    <h2>2. Processing Instructions and Security</h2>
    <p>The Processor shall process personal data solely on the documented instructions of the Controller. The Processor agrees to implement state-of-the-art technical and organizational security measures (including data sanitization and encryption-at-rest) to prevent unauthorized disclosures or breaches.</p>
  </div>
  <div class="signatures">
    <div class="sig-col">
      <p>Processor: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Data Privacy Officer</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>Controller: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Chief Information Security Officer</p>
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