require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.generatedDocument.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log("ALL DOCUMENTS:", JSON.stringify(docs.map(d => ({
    id: d.id,
    entityType: d.entityType,
    entityId: d.entityId,
    status: d.status,
    createdAt: d.createdAt
  })), null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
