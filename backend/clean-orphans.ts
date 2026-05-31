// @ts-nocheck
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const docs = await prisma.generatedDocument.findMany({ include: { template: true } });
  const orphans = docs.filter(d => !d.template);
  console.log('Orphaned generated documents:', orphans.length);
  if (orphans.length > 0) {
    await prisma.generatedDocument.deleteMany({ where: { id: { in: orphans.map(o => o.id) } } });
  }
  console.log('Cleaned orphans.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
