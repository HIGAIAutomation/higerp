const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  try {
    const tenants = await prisma.tenant.findMany();
    console.log("TENANTS:", tenants);
    const users = await prisma.user.findMany();
    console.log("USERS:", users);
  } catch (err) {
    console.error("DB Query error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
