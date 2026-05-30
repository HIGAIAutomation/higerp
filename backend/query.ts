import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const doc = await prisma.generatedDocument.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { template: true }
  });
  if (doc) {
    console.log("=== Compiled HTML ===");
    console.log(doc.compiledHtml);
  } else {
    console.log("No document found.");
  }
  await prisma.$disconnect();
}
main().catch(err => {
  console.error(err);
});
