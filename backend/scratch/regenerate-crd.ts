import { PrismaClient } from '@prisma/client';
import * as Handlebars from 'handlebars';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const tenantId = '00000000-0000-0000-0000-000000000000';
  const leads = await prisma.lead.findMany({
    where: { tenantId }
  });

  console.log(`Found ${leads.length} leads to update.`);

  const templateName = 'Client Requirement Document';
  const template = await prisma.documentTemplate.findFirst({
    where: { name: templateName, tenantId },
    orderBy: { createdAt: 'desc' }
  });

  if (!template) {
    console.error(`Template "${templateName}" not found in database!`);
    return;
  }

  // Delete all existing CRD generated documents so they get rebuilt with the new layout
  const deleted = await prisma.generatedDocument.deleteMany({
    where: {
      tenantId,
      templateId: template.id,
      entityType: 'LEAD'
    }
  });
  console.log(`Deleted ${deleted.count} old lead requirement documents.`);

  for (const lead of leads) {
    console.log(`Compiling CRD for lead: "${lead.companyName}"...`);
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

    if (!Handlebars.helpers['or']) {
      Handlebars.registerHelper('or', function (a, b) {
        return a || b;
      });
    }

    const compiledTemplate = Handlebars.compile(template.contentHtml);
    const contentHtml = compiledTemplate(quoteData);

    await prisma.generatedDocument.create({
      data: {
        tenantId,
        templateId: template.id,
        entityType: 'LEAD',
        entityId: lead.id,
        status: 'generated',
        filePath: 'path/to/generated/doc.html',
        compiledHtml: contentHtml,
      }
    });
  }

  console.log('Successfully regenerated all CRDs.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
