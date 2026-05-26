import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

const connectionString = "postgres://postgres:postgres@127.0.0.1:51214/template1?sslmode=disable";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
