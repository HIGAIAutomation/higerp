import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const posts = await prisma.marketingPost.findMany();
  console.log(JSON.stringify(posts, null, 2));
  await prisma.$disconnect();
  await pool.end();
}
main().catch(err => {
  console.error(err);
});
