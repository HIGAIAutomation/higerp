const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        tenantId: true,
      }
    });
    console.log("USERS:", res);
  } catch (err) {
    console.error("DB Query error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
