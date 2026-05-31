const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const doc = await prisma.generatedDocument.findUnique({
    where: { id: 'a4a7d7aa-2b35-4332-9dbc-9a12faa17648' }
  });
  console.log("Failed Document:", doc?.id, doc?.status, "Project ID:", doc?.entityId);

  if (doc) {
    const allDocs = await prisma.generatedDocument.findMany({
      where: { entityId: doc.entityId }
    });
    console.log("All docs in project:");
    for (let d of allDocs) {
      console.log("-", d.id, d.documentName, d.status);
    }
  }
}

check().then(() => prisma.$disconnect());
