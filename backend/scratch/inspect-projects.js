require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.project.count();
  console.log("TOTAL PROJECTS COUNT:", count);

  const projects = await prisma.project.findMany({});
  console.log("PROJECTS IN DB:", JSON.stringify(projects, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
