import { PrismaClient } from '@prisma/client';
import * as Handlebars from 'handlebars';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const tenantId = '00000000-0000-0000-0000-000000000000';
  const projects = await prisma.project.findMany({
    where: { tenantId },
    include: { client: true }
  });

  console.log(`Found ${projects.length} projects to update.`);

  const lifecycleDocs = [
    'Non-Disclosure Agreement (NDA) - Client',
    'Master Service Agreement (MSA)',
    'Statement of Work (SOW)',
    'Service Level Agreement (SLA)',
    'Project Proposal',
    'Intellectual Property Agreement',
    'Data Processing Agreement (DPA)',
  ];

  for (const project of projects) {
    console.log(`Regenerating docs for project: "${project.name}" (Category: ${project.category})...`);

    // Delete old generated docs for this project
    await prisma.generatedDocument.deleteMany({
      where: { entityId: project.id, entityType: 'PROJECT', tenantId }
    });

    const compileData = {
      projectName: project.name,
      clientName: (project as any).clientName || project.client?.username || 'Valued Client',
      companyName: 'HIG AI Automation LLP',
      startDate: project.startDate ? new Date(project.startDate).toLocaleDateString() : '____________',
      endDate: project.endDate ? new Date(project.endDate).toLocaleDateString() : '____________',
      price: project.price ? `₹${project.price.toLocaleString('en-IN')}` : '₹6,000.00',
      postCount: project.postCount || 15,
      videoCount: project.videoCount || 6,
      isWebProject: project.category === 'Web/App Development',
      isDigitalMarketing: project.category === 'Digital Marketing',
      isAutomation: project.category === 'Automation',
      isAiDevelopment: project.category === 'AI Development',
      moduleDetails: project.moduleDetails || [],
      projectInclusions: (project as any).projectInclusions || '',
      inclusions: (project as any).projectInclusions ? (project as any).projectInclusions.split(/[,\n]+/).map((x: string) => x.trim()).filter(Boolean) : [],
    };

    for (const docName of lifecycleDocs) {
      const template = await prisma.documentTemplate.findFirst({
        where: { name: docName, tenantId },
        orderBy: { createdAt: 'desc' }
      });

      if (!template) {
        console.warn(`Template "${docName}" not found!`);
        continue;
      }

      if (!Handlebars.helpers['or']) {
        Handlebars.registerHelper('or', function (a, b) {
          return a || b;
        });
      }
      const compiledTemplate = Handlebars.compile(template.contentHtml);
      const contentHtml = compiledTemplate(compileData);

      await prisma.generatedDocument.create({
        data: {
          tenantId,
          templateId: template.id,
          entityType: 'PROJECT',
          entityId: project.id,
          status: 'generated',
          filePath: 'path/to/generated/doc.html',
          compiledHtml: contentHtml,
        }
      });
    }
  }

  console.log('All documents successfully regenerated.');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
