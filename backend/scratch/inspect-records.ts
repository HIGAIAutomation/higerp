import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  console.log('--- USERS ---');
  const users = await prisma.user.findMany({ take: 5 });
  console.log(JSON.stringify(users, null, 2));

  console.log('--- EMPLOYEES ---');
  const employees = await prisma.employee.findMany({ take: 5 });
  console.log(JSON.stringify(employees, null, 2));

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
