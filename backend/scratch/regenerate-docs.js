const { PrismaClient } = require('@prisma/client');
const Handlebars = require('handlebars');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const projectId = 'debe9d1b-f9bc-4e05-a0f8-702c47e94fd7';
  const tenantId = '00000000-0000-0000-0000-000000000000';

  console.log(`Searching for project with ID: ${projectId}...`);
  const project = await prisma.project.findFirst({
    where: { id: projectId, tenantId },
    include: { client: true }
  });

  if (!project) {
    console.error('Project not found!');
    return;
  }

  console.log(`Found project: "${project.name}" with client: "${project.client?.username || 'vignesh'}"`);

  // 1. Delete old generated documents for this project
  console.log('Deleting old generated documents for this project...');
  const deleteResult = await prisma.generatedDocument.deleteMany({
    where: { entityId: projectId, entityType: 'PROJECT', tenantId }
  });
  console.log(`Deleted ${deleteResult.count} old documents.`);

  // 2. Generate new documents based on updated templates
  const lifecycleDocs = [
    'Non-Disclosure Agreement (NDA) - Client',
    'Master Service Agreement (MSA)',
    'Statement of Work (SOW)',
    'Service Level Agreement (SLA)',
    'Project Proposal',
    'Intellectual Property Agreement',
    'Data Processing Agreement (DPA)',
  ];

  const compileData = {
    projectName: project.name,
    clientName: project.client?.username || 'vignesh',
    companyName: 'HIG AI Automation LLP',
    startDate: project.startDate ? new Date(project.startDate).toLocaleDateString() : '____________',
    endDate: project.endDate ? new Date(project.endDate).toLocaleDateString() : '____________',
    price: project.price ? `₹${project.price.toLocaleString('en-IN')}` : '₹6,000.00',
    postCount: project.postCount || 15,
    videoCount: project.videoCount || 6,
  };

  console.log('Compiling and saving new documents with dynamic client data & terms...');
  for (const docName of lifecycleDocs) {
    const template = await prisma.documentTemplate.findFirst({
      where: { name: docName, tenantId },
      orderBy: { createdAt: 'desc' }
    });

    if (!template) {
      console.warn(`Template "${docName}" not found! Skipping...`);
      continue;
    }

    const compiledTemplate = Handlebars.compile(template.contentHtml);
    const contentHtml = compiledTemplate(compileData);

    await prisma.generatedDocument.create({
      data: {
        tenantId,
        templateId: template.id,
        entityType: 'PROJECT',
        entityId: projectId,
        status: 'generated',
        filePath: 'path/to/generated/doc.html',
        compiledHtml: contentHtml,
      }
    });
    console.log(`- Regenerated: "${docName}"`);
  }

  console.log('Documents successfully updated to use new digital marketing templates!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
