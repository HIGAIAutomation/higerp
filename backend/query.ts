import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.marketingPost.findMany();
  console.log(JSON.stringify(posts, null, 2));
  await prisma.$disconnect();
}
main().catch(err => {
  console.error(err);
});
