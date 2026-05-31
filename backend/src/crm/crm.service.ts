import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentService } from '../document/document.service';

@Injectable()
export class CrmService {
  constructor(
    private prisma: PrismaService,
    private documentService: DocumentService,
  ) {}

  async createLead(tenantId: string, data: any) {
    const count = await this.prisma.lead.count({ where: { tenantId } });
    const uniqueId = `LEAD-${1000 + count + 1}`;

    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        companyName: data.companyName,
        contact: data.contact,
        source: data.source,
        valEstimate: data.valEstimate,
        status: data.status || 'new',
        uniqueId,
        interestedService: data.interestedService || null,
        requirements: data.requirements || null,
        metadata: data.metadata || {},
      },
    });

    try {
      await this.generateClientRequirementDocument(tenantId, lead.id);
    } catch (err) {
      console.error('Failed to generate CRD on lead capture', err);
    }

    return lead;
  }

  async createPackage(tenantId: string, data: any) {
    return this.prisma.package.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        tiers: {
          create: data.tiers || [],
        },
      },
    });
  }

  async generateQuote(tenantId: string, leadId: string, packageId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    const pkg = await this.prisma.package.findUnique({ 
      where: { id: packageId },
      include: { tiers: true } 
    });

    if (!lead || !pkg) throw new Error('Lead or Package not found');

    const quoteData = {
      clientName: lead.companyName,
      packageName: pkg.name,
      basePrice: pkg.basePrice,
      tiers: pkg.tiers,
      companyName: 'HIG AI Automation LLP',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };

    return this.documentService.generateDocument(
      'Sales Quotation',
      tenantId,
      quoteData,
      'LEAD',
      leadId,
    );
  }

  async getLeads(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId },
      include: { opportunities: true, followUps: true },
    });
  }

  async updateLead(tenantId: string, id: string, data: any) {
    const lead = await this.prisma.lead.update({
      where: { id, tenantId },
      data: {
        companyName: data.companyName,
        contact: data.contact,
        source: data.source,
        valEstimate: parseFloat(data.valEstimate) || 0,
        status: data.status,
        interestedService: data.interestedService || null,
        requirements: data.requirements || null,
        metadata: data.metadata || {},
      },
    });

    try {
      await this.generateClientRequirementDocument(tenantId, lead.id);
    } catch (err) {
      console.error('Failed to regenerate CRD on lead update', err);
    }

    return lead;
  }

  async deleteLead(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead || lead.tenantId !== tenantId) {
      throw new Error('Lead not found');
    }

    await this.prisma.opportunity.deleteMany({
      where: { leadId: id }
    });

    await this.prisma.followUp.deleteMany({
      where: { leadId: id }
    });

    return this.prisma.lead.delete({
      where: { id }
    });
  }

  async getPackages(tenantId: string) {
    return this.prisma.package.findMany({
      where: { tenantId },
      include: { tiers: true },
    });
  }

  async updatePackage(tenantId: string, id: string, data: any) {
    await this.prisma.pricingTier.deleteMany({
      where: { packageId: id }
    });

    return this.prisma.package.update({
      where: { id, tenantId },
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        tiers: {
          create: data.tiers || [],
        },
      },
    });
  }

  async deletePackage(tenantId: string, id: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });
    if (!pkg || pkg.tenantId !== tenantId) {
      throw new Error('Package not found');
    }

    await this.prisma.pricingTier.deleteMany({
      where: { packageId: id }
    });

    return this.prisma.package.delete({
      where: { id }
    });
  }

  async generateClientRequirementDocument(tenantId: string, leadId: string) {
    const templateName = 'Client Requirement Document';
    let template = await this.prisma.documentTemplate.findFirst({
      where: { name: templateName, tenantId }
    });

    const contentHtml = `
<div style="font-family: 'Inter', sans-serif; padding: 20px; line-height: 1.6; color: #334155;">
  <!-- Premium Brand Header -->
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #2E9EDE; padding-bottom: 20px;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <!-- Modern Styled SVG Logo for HIG AI Automation -->
      <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
        <rect width="100" height="100" rx="24" fill="#0F172A"/>
        <path d="M30 30H42V70H30V30Z" fill="#2E9EDE"/>
        <path d="M58 30H70V70H58V30Z" fill="#2E9EDE"/>
        <path d="M42 45H58V55H42V45Z" fill="#2E9EDE"/>
      </svg>
      <div>
        <h2 style="color: #0f172a; margin: 0; font-size: 16px; font-weight: 800; letter-spacing: 0.5px; line-height: 1.2;">HIG AI AUTOMATION LLP</h2>
        <p style="margin: 3px 0 0 0; font-size: 9px; color: #64748b; font-weight: 500; max-width: 320px; line-height: 1.3;">
          PPCQ+XH5, 6, S Bazaar, Palayamkottai, Tirunelveli, Tamil Nadu 627002
          <br/>
          <span style="font-weight: 700; color: #2e9ede; margin-top: 2px; display: inline-block;">Reg No / LLPIN: AAY-0857</span>
        </p>
      </div>
    </div>
    <div style="text-align: right;">
      <h1 style="color: #0f172a; margin: 0; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">CLIENT REQUIREMENT SPECIFICATION</h1>
      <p style="margin: 3px 0 0 0; font-size: 11px; font-family: monospace; font-weight: 700; color: #64748b; letter-spacing: 1px;">UNIQUE ID: {{uniqueId}}</p>
    </div>
  </div>

  <div style="margin-bottom: 30px;">
    <h3 style="color: #1e293b; border-left: 4px solid #2E9EDE; padding-left: 10px; margin-bottom: 15px; font-size: 16px; font-weight: 700;">1. CUSTOMER INFORMATION</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 6px 0; font-weight: 600; width: 180px;">Company/Client Name:</td>
        <td style="padding: 6px 0;">{{companyName}}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600;">Contact Email/Phone:</td>
        <td style="padding: 6px 0;">{{contact}}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600;">Lead Source:</td>
        <td style="padding: 6px 0;">{{source}}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-weight: 600;">Interested Service:</td>
        <td style="padding: 6px 0;">{{interestedService}}</td>
      </tr>
    </table>
  </div>

  <div style="margin-bottom: 30px;">
    <h3 style="color: #1e293b; border-left: 4px solid #2E9EDE; padding-left: 10px; margin-bottom: 15px; font-size: 16px; font-weight: 700;">2. PROJECT SCOPE & SUMMARY</h3>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; font-size: 14px; font-style: italic;">
      {{requirements}}
    </div>
  </div>

  {{#if isWebApp}}
  <div style="margin-bottom: 30px;">
    <h3 style="color: #1e293b; border-left: 4px solid #2E9EDE; padding-left: 10px; margin-bottom: 15px; font-size: 16px; font-weight: 700;">3. SYSTEM MODULE BREAKDOWN</h3>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px;">
      <thead>
        <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 10px; font-weight: 700;">Module Name</th>
          <th style="padding: 10px; font-weight: 700;">Price (INR)</th>
          <th style="padding: 10px; font-weight: 700;">Description</th>
        </tr>
      </thead>
      <tbody>
        {{#each modules}}
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: 600;">{{name}}</td>
          <td style="padding: 10px; font-weight: 700; color: #2e9ede;">₹{{price}}</td>
          <td style="padding: 10px; color: #64748b;">{{description}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
  {{/if}}

  {{#if isDigitalMarketing}}
  <div style="margin-bottom: 30px;">
    <h3 style="color: #1e293b; border-left: 4px solid #2E9EDE; padding-left: 10px; margin-bottom: 15px; font-size: 16px; font-weight: 700;">3. CAMPAIGN DELIVERABLES</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 0; font-weight: 600; width: 220px;">Target Reels Count:</td>
        <td style="padding: 10px 0; font-weight: 700; color: #2e9ede;">{{reelsCount}}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 0; font-weight: 600;">Target Image Posters Count:</td>
        <td style="padding: 10px 0; font-weight: 700; color: #2e9ede;">{{postersCount}}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 0; font-weight: 600;">Branding Kits Required:</td>
        <td style="padding: 10px 0;">{{brandingKits}}</td>
      </tr>
      {{#if marketingPlatforms}}
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 0; font-weight: 600;">Selected Social Platforms:</td>
        <td style="padding: 10px 0;">{{marketingPlatforms}}</td>
      </tr>
      {{/if}}
    </table>
  </div>
  {{/if}}

  {{#if isWebApp}}
  <div style="margin-bottom: 30px; page-break-inside: avoid;">
    <h3 style="color: #1e293b; border-left: 4px solid #2E9EDE; padding-left: 10px; margin-bottom: 15px; font-size: 16px; font-weight: 700;">4. PROPOSED TECH STACK & SYSTEM ARCHITECTURE</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <thead>
        <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left;">
          <th style="padding: 10px; font-weight: 700; width: 30%;">Layer</th>
          <th style="padding: 10px; font-weight: 700; width: 35%;">Technology</th>
          <th style="padding: 10px; font-weight: 700; width: 35%;">Purpose / Usage</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: 600;">Frontend</td>
          <td style="padding: 10px; font-weight: 700; color: #2e9ede;">React (Vite) + Tailwind CSS</td>
          <td style="padding: 10px; color: #64748b;">Fast, responsive, and modern user interface development.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: 600;">Backend</td>
          <td style="padding: 10px; font-weight: 700; color: #2e9ede;">Node.js + Express.js</td>
          <td style="padding: 10px; color: #64748b;">Scalable server-side API application logic.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: 600;">Database (Primary)</td>
          <td style="padding: 10px; font-weight: 700; color: #2e9ede;">MongoDB (Cloudinary for Images)</td>
          <td style="padding: 10px; color: #64748b;">Primary text data storage; Cloudinary handles images.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: 600;">Database (AWS Extension)</td>
          <td style="padding: 10px; font-weight: 700; color: #2e9ede;">AWS DynamoDB + S3 Bucket</td>
          <td style="padding: 10px; color: #64748b;">DynamoDB for high-throughput text; S3 for PDFs, images, docs.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: 600;">Serverless / API Host</td>
          <td style="padding: 10px; font-weight: 700; color: #2e9ede;">AWS Lambda (End API)</td>
          <td style="padding: 10px; color: #64748b;">Serverless API host for standard application integration.</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: 600;">Payment Gateway</td>
          <td style="padding: 10px; font-weight: 700; color: #2e9ede;">Razorpay</td>
          <td style="padding: 10px; color: #64748b;">Secure local & global online checkout and billing.</td>
        </tr>
      </tbody>
    </table>
  </div>
  {{/if}}

  <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; text-align: center; color: #94a3b8;">
    This document was generated automatically by the CRM Lead Intake engine on {{generatedAt}}.
  </div>
</div>
`;

    if (!template) {
      template = await this.prisma.documentTemplate.create({
        data: {
          tenantId,
          name: templateName,
          category: 'CRM',
          contentHtml
        }
      });
    } else {
      template = await this.prisma.documentTemplate.update({
        where: { id: template.id },
        data: { contentHtml }
      });
    }

    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) return;

    const meta: any = lead.metadata || {};

    const quoteData = {
      uniqueId: lead.uniqueId,
      companyName: lead.companyName,
      contact: lead.contact,
      source: lead.source,
      interestedService: lead.interestedService || 'Custom AI Solution',
      requirements: lead.requirements || 'N/A',
      isWebApp: meta.category === 'Web/App Development',
      isDigitalMarketing: meta.category === 'Digital Marketing',
      modules: meta.modules || [],
      reelsCount: meta.reelsCount || 0,
      postersCount: meta.postersCount || 0,
      brandingKits: meta.brandingKits || 'No',
      marketingPlatforms: meta.platforms || 'N/A',
      generatedAt: new Date().toLocaleDateString()
    };

    return this.documentService.generateDocument(
      templateName,
      tenantId,
      quoteData,
      'LEAD',
      leadId
    );
  }

  async sendGoogleCalendarInvite(followUp: any) {
    const nodemailer = require('nodemailer');
    // Allow overriding gmail password via env variable if present, else fallback to provided pass
    const pass = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD || 'Aj@6381726852';
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'aiautomationhig@gmail.com',
        pass: pass,
      },
    });

    const eventDateTime = new Date(followUp.dateTime);
    const endDateTime = followUp.endDateTime ? new Date(followUp.endDateTime) : new Date(eventDateTime.getTime() + 30 * 60 * 1000);

    const uid = `followup-${followUp.id}@higerp.com`;
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HIG ERP//CRM FOLLOWUP//EN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(eventDateTime)}`,
      `DTEND:${formatICSDate(endDateTime)}`,
      `SUMMARY:Follow-up Reminder - ${followUp.lead?.companyName || 'Lead callback'}`,
      `DESCRIPTION:Scheduled follow-up notes: ${followUp.notes || 'No notes provided.'}`,
      `ORGANIZER;CN=HIG ERP:mailto:aiautomationhig@gmail.com`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    try {
      await transporter.sendMail({
        from: 'aiautomationhig@gmail.com',
        to: 'aiautomationhig@gmail.com',
        subject: `📅 Follow-up Reminder: ${followUp.lead?.companyName || 'Callback scheduled'}`,
        text: `Follow-up scheduled on: ${eventDateTime.toLocaleString()} to ${endDateTime.toLocaleString()}\nNotes: ${followUp.notes || 'N/A'}`,
        alternatives: [
          {
            contentType: 'text/calendar; charset="utf-8"; method=PUBLISH',
            content: icsContent,
          },
        ],
      });

      await this.prisma.followUp.update({
        where: { id: followUp.id },
        data: { synced: true }
      });
      console.log('Google Calendar sync email invitation sent successfully.');
    } catch (err: any) {
      console.error('Google Calendar email invitation failed:', err);
      // Log custom warning for Google's Application Password requirements
      if (err.code === 'EAUTH') {
        console.warn('Authentication failed: Google requires an App Password for accounts with 2FA enabled. Please set GMAIL_APP_PASSWORD in backend/.env.');
      }
    }
  }

  async createFollowUp(tenantId: string, data: any) {
    const followUp = await this.prisma.followUp.create({
      data: {
        tenantId,
        leadId: data.leadId,
        dateTime: new Date(data.dateTime),
        endDateTime: data.endDateTime ? new Date(data.endDateTime) : null,
        notes: data.notes || '',
      },
      include: {
        lead: true
      }
    });

    try {
      await this.sendGoogleCalendarInvite(followUp);
    } catch (err) {
      console.error(err);
    }
    return this.prisma.followUp.findUnique({
      where: { id: followUp.id },
      include: { lead: true }
    });
  }

  async getFollowUps(tenantId: string) {
    return this.prisma.followUp.findMany({
      where: { tenantId },
      include: {
        lead: true
      },
      orderBy: {
        dateTime: 'asc'
      }
    });
  }

  async deleteFollowUp(tenantId: string, id: string) {
    const followup = await this.prisma.followUp.findUnique({ where: { id } });
    if (!followup || followup.tenantId !== tenantId) {
      throw new Error('Follow-up not found');
    }

    return this.prisma.followUp.delete({
      where: { id }
    });
  }
}
