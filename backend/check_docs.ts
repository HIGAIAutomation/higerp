import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.generatedDocument.findMany({
    include: { template: true }
  });
  console.log(`TOTAL DOCUMENTS IN DB: ${docs.length}`);
  for (const doc of docs) {
    console.log(`- ID: ${doc.id}`);
    console.log(`  Name: ${doc.template?.name || 'Unknown'}`);
    console.log(`  EntityId: ${doc.entityId}`);
    console.log(`  EntityType: ${doc.entityType}`);
    console.log(`  Compiled HTML Length: ${doc.compiledHtml?.length ?? 'null'}`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
