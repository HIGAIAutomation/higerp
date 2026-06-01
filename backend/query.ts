import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.generatedDocument.findMany({
    include: { template: true }
  });
  console.log("=== Generated Documents ===");
  console.log(JSON.stringify(docs.map((d: any) => ({
    id: d.id,
    entityId: d.entityId,
    entityType: d.entityType,
    status: d.status,
    templateName: d.template?.name,
    hasHtml: !!d.compiledHtml,
    tenantId: d.tenantId
  })), null, 2));
  await prisma.$disconnect();
}
main().catch(err => {
  console.error(err);
});
