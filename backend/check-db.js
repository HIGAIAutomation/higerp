require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const posts = await prisma.marketingPost.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log("MARKETING POSTS:", JSON.stringify(posts, null, 2));

  const history = await prisma.marketingPostHistory.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log("HISTORY POSTS:", JSON.stringify(history, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
