import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const tenantId = '00000000-0000-0000-0000-000000000000'; // Default System Tenant for testing

  // Ensure system tenant exists
  await prisma.tenant.upsert({
    where: { id: tenantId, slug: 'system' },
    update: {},
    create: {
      id: tenantId,
      name: 'HIG System',
      slug: 'system',
    },
  });

  // Seed Default Superadmin User if not present
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
  } else {
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    padding-bottom: 12px;
  }
  
  .company-logo {
    max-height: 48px;
    max-width: 140px;
    object-fit: contain;
  }
  
  .company-details {
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
  }

  .header-title-block {
    text-align: center;
    margin-top: 25px;
    margin-bottom: 35px;
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
    <h1>Mutual Non-Disclosure Agreement</h1>
    <p>Effective Date: {{startDate}} | Associated Project: {{projectName}}</p>
  </div>
  
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
    <h1>Master Service Agreement</h1>
    <p>Effective Date: {{startDate}} | Term: 1-Year Agreement</p>
  </div>
  
  <div class="section">
    <h2>1. Engagement & 1-Year Term</h2>
    <p>This Master Service Agreement ("Agreement") establishes the legal and commercial terms under which <strong>{{companyName}}</strong> ("Agency") will perform digital marketing, lead generation, and social media brand development services for <strong>{{clientName}}</strong> ("Client"). The term of this Agreement is exactly one (1) year (12 calendar months) starting from the Effective Date of {{startDate}}.</p>
  </div>

  <div class="section">
    <h2>2. Fixed Service Fees & Month-End Billing</h2>
    <p>The Client shall pay the Agency a monthly service fee of <strong>{{price}}</strong> (six thousand standard currency units). Invoicing and payments are structured as follows:</p>
    <ul>
      <li><strong>Month-End Payments</strong>: The invoice will be generated and shared at the end of each billing month. Payment is due strictly on the last day of the active service month.</li>
      <li><strong>Ad Campaign Budgets</strong>: The monthly service fee of {{price}} covers campaign management only. All respective direct ad spends (e.g., Meta/Google ad budgets) will be funded directly by the Client based on client opinion, preferences, and approval.</li>
      <li><strong>Late Payments</strong>: Delay in monthly payments may lead to immediate suspension of posting and ad campaign moderation.</li>
    </ul>
  </div>

  <div class="section">
    <h2>3. 3-Month Performance Trial (Exit Clause)</h2>
    <p>Both Parties agree to an initial trial and evaluation phase. If the promotion and ad running campaigns do not generate any active customer leads for the Client’s business within three (3) consecutive months from the setup completion, either Party has the absolute right to discontinue services and terminate this Agreement after the third month, with no early termination penalties or ongoing 1-year contract liabilities. The monthly service fee for the three active months remains due and non-refundable.</p>
  </div>

  <div class="section">
    <h2>4. Out-of-Scope Additional Services</h2>
    <p>Services not explicitly detailed in the active SOW are considered Out-of-Scope and will be billed separately. These extra works include, but are not limited to, specialized offline/print banner designs, corporate catalogs, certificate designs, custom corporate graphic kits, and on-site media shoots. Extra works will be invoiced separately in the active billing month based on agreed prices or hourly charges.</p>
  </div>

  <div class="section">
    <h2>5. Social Media Prerequisites</h2>
    <p>As a condition precedent to starting any design or ad campaigns, the Client promises and agrees to provide the Agency complete administrative access, logins, credentials, and page manager permissions for all requested social media accounts. The Agency is not liable for project startup delays caused by the Client's failure to provision these permissions.</p>
  </div>

  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Agency Director</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>For: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Client Representative</p>
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
    <p>This Statement of Work (SOW) details the deliverables, campaigns, and creative workflows for project: <strong>{{projectName}}</strong>. The Agency shall execute the following recurring monthly campaign assets:</p>
    <ul>
      <li><strong>{{postCount}} Customized Brand Posters</strong>: Standard graphic designs delivered per month, highlighting offers, testimonials, and features.</li>
      <li><strong>{{videoCount}} Professionally Edited Reels / Short Videos</strong>: Engaging, trend-conscious, vertical video edits per month.</li>
      <li><strong>Special Day Holiday Promotion Posters</strong>: Complementary graphic assets delivered for every nationally recognized or industry-relevant special holiday falling in the calendar month.</li>
      <li><strong>2 Active Ad Campaigns</strong>: Run and optimized per month on Meta Platforms to acquire active, qualified leads.</li>
    </ul>
  </div>

  <div class="section">
    <h2>2. Creative Production & Editorial Pipelines</h2>
    <p>To maintain high consistency and optimal brand tone, both parties agree to follow this strict monthly planning schedule:</p>
    <ol>
      <li><strong>Content Calendar Delivery</strong>: The Agency will share the comprehensive content sheet for the upcoming month on the <strong>30th of the previous month</strong> to the Client for verification.</li>
      <li><strong>Revision & Approval Phase</strong>: Before the client approves, the Agency will accept feedback and change the content accordingly. The client agrees to complete the verification and provide final sign-off within <strong>two (2) days</strong> of receiving the sheet.</li>
      <li><strong>Content Freeze</strong>: Once the content sheet is approved by the Client, no further design plans or calendar revisions will be made for that month, ensuring the scheduling remains uninterrupted.</li>
      <li><strong>Respective Delivery Approval</strong>: Posters are scheduled for specific calendar days. To guarantee daily publications, individual poster files shared for daily review must be verified and approved by the Client within approximately <strong>three (3) hours</strong> of submission.</li>
    </ol>
  </div>

  <div class="section">
    <h2>3. Video Shoots & Meta Account Setup Details</h2>
    <ul>
      <li><strong>Reel Shoots & Videography Billing</strong>: Standard editing is included in the base fee for client-supplied clips. If the Client requests the Agency to physically shoot video footage at their retail shop, workplace, or event space, the shoot will be billed separately as extra work based on the actual hours spent.</li>
      <li><strong>Meta Ads Setup Timeframe</strong>: If a new Meta Business Manager or Ad account setup is required, a dedicated <strong>two (2) day setup timeframe</strong> is designated at start-up to establish tracking pixels, catalog integrations, and verification before running active ads.</li>
    </ul>
  </div>

  <div class="section">
    <h2>4. Posting Schedules</h2>
    <p>The Agency will schedule and publish all posters, reels, and video assets strictly during proven <strong>high-traffic peak times</strong>. The Agency will not post at any low-traffic hours to protect brand visibility and optimization metrics.</p>
  </div>

  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Creative Director</p>
      <p>Date: ______________</p>
    </div>
    <div class="sig-col">
      <p>For: <strong>{{clientName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Marketing Lead</p>
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
    <h2>1. Creative Asset Approval SLAs</h2>
    <p>This SLA outlines critical turnaround and response rules. Compliance with these SLAs is mandatory to preserve the daily marketing calendar:</p>
    <ul>
      <li><strong>Monthly Content Calendar SLA</strong>: The Agency delivers the calendar sheet on the 30th of the previous month. The Client must provide review notes or approval within <strong>2 days (48 Hours)</strong>.</li>
      <li><strong>Daily Poster Approval SLA</strong>: For scheduled daily posters, the Client agrees to review and approve shared drafts within <strong>three (3) hours</strong> of delivery. Delay in approvals will push the release to the next peak high-traffic window.</li>
      <li><strong>New Meta Account Setup SLA</strong>: Setup, tracking configuration, and payment mapping for newly registered Meta Ads accounts shall be completed by the Agency within exactly <strong>2 days (48 Hours)</strong>.</li>
    </ul>
  </div>

  <div class="section">
    <h2>2. Publishing Optimization & Posting Windows</h2>
    <p>To maximize engagement, publishing occurs strictly in certified high-traffic slots. The active windows are scheduled based on platform data:</p>
    <ul>
      <li><strong>Primary Peak Slots (High-Traffic)</strong>: Noon slot (12:00 PM - 2:00 PM) and Evening slot (6:30 PM - 9:00 PM).</li>
      <li><strong>Off-Peak Standard</strong>: No assets will be published during off-peak times. If approvals are delayed by the client, publishing will automatically be rescheduled to the next day's primary peak slot.</li>
    </ul>
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
    <h1>Digital Marketing Strategy Proposal</h1>
    <p>Prepared for: {{clientName}} | Associated Project: {{projectName}}</p>
  </div>
  
  <div class="section">
    <h2>1. Campaign Objective</h2>
    <p>To execute a premium brand promotion and active lead-generation campaign for <strong>{{clientName}}</strong>. By developing high-impact vertical videos, modern poster designs, and optimizing target-oriented Meta ad campaigns, the Agency will establish digital authority and acquire customer leads for the client's business: <strong>{{projectName}}</strong>.</p>
  </div>

  <div class="section">
    <h2>2. Campaign Deliverables Package</h2>
    <p>The package contains the following high-value assets and execution strategies:</p>
    <ul>
      <li><strong>Organic Branding</strong>: {{postCount}} customized graphic posters + {{videoCount}} custom-edited vertical reels per month.</li>
      <li><strong>Holiday Reach</strong>: Promo graphics for every calendar special day and holiday.</li>
      <li><strong>Paid Leads</strong>: Setup and optimization of two (2) targeted ad campaigns per month on Instagram & Facebook.</li>
      <li><strong>Peak Hour Publishing</strong>: All postings scheduled during high-traffic times to maximize viral reach.</li>
    </ul>
  </div>

  <div class="section">
    <h2>3. Commercial Commitment & Trial Phase</h2>
    <ul>
      <li><strong>Monthly Management Charge</strong>: Fixed service charge of <strong>{{price}}</strong> per month, billed at the month-end.</li>
      <li><strong>Direct Ad Spend</strong>: Directed based on client opinion, billed directly to the client's credit card.</li>
      <li><strong>Performance Trial Guarantee</strong>: A 3-month trial period is offered. If zero leads are generated by the 3rd month, the contract can be terminated immediately with no ongoing commitment.</li>
    </ul>
  </div>

  <div class="signatures">
    <div class="sig-col">
      <p>Prepared by: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Digital Strategy Director</p>
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
    <h2>1. Ownership of Campaign Deliverables</h2>
    <p>All finished promotional posters ({{postCount}} per month), custom reels ({{videoCount}} per month), special day graphics, and custom campaign ad structures created specifically for <strong>{{projectName}}</strong> will belong to <strong>{{clientName}}</strong>. The transfer of copyright and intellectual property rights for each month's creative assets takes place <strong>only upon receipt of the monthly service fee of {{price}} at the month-end</strong>.</p>
  </div>

  <div class="section">
    <h2>2. Social Media Pages & Admin Rights</h2>
    <p>All login permissions, admin authorizations, and user accesses to the requested social media accounts provided by the Client will remain the sole, exclusive property of the Client. The Agency does not acquire any ownership interest, rights, or claims over the Client's social accounts, channels, or platform handles.</p>
  </div>

  <div class="section">
    <h2>3. Pre-Existing Agency Assets</h2>
    <p>The Agency retains full ownership and intellectual rights over its core pre-existing assets, design source files, master Photoshop/Illustrator layout templates, editing presets, stock footage licenses, and proprietary strategies. The Client is granted a non-exclusive license to publish the finalized assets globally.</p>
  </div>

  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Creative Assignor</p>
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
    <p>This Data Processing Addendum regulates the secure handling and retrieval of personal data in connection with the campaign <strong>{{projectName}}</strong>. During the course of running two (2) targeted ad campaigns per month, the Agency will collect customer leads on behalf of the Client. Under applicable privacy laws, <strong>{{clientName}}</strong> is the Data Controller, and <strong>{{companyName}}</strong> is the Data Processor.</p>
  </div>

  <div class="section">
    <h2>2. Categories of Processed Data</h2>
    <p>Processing will strictly cover standard customer leads generated through Meta Lead-Generation Forms and landing pages. This includes: Customer names, telephone numbers, emails, physical location details, and service inquiry options.</p>
  </div>

  <div class="section">
    <h2>3. Data Protection & Leads Security</h2>
    <p>The Processor (Agency) agrees to: (a) process leads data solely to deliver, download, and sync them to the Controller's verified database or CRM; (b) restrict internal lead access to campaign managers; and (c) never sell, share, or store leads data for any third-party marketing purposes. The Processor will maintain robust access controls to prevent data breaches.</p>
  </div>

  <div class="signatures">
    <div class="sig-col">
      <p>For: <strong>{{companyName}}</strong></p>
      <div class="sig-line"></div>
      <p class="sig-label">Data Privacy Representative</p>
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
      where: { id: t.name + tenantId, tenantId, name: t.name }, // Use name as pseudo-id for seed
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

  // Seed Sample Packages
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
