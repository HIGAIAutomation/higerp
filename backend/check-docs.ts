// @ts-nocheck
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const projects = await prisma.project.findMany();
  for (const p of projects) {
    const docs = await prisma.generatedDocument.findMany({
      where: { entityId: p.id },
      include: { template: true }
    });
    console.log('Project', p.id, p.category, 'Docs:', docs.map(d => d.template ? d.template.name : 'Unknown'));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
