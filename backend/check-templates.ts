import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const templates = await prisma.documentTemplate.findMany();
  console.log('Templates in DB:', templates.map(t => t.name));
}
main().catch(console.error).finally(() => prisma.$disconnect());
