"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    const posts = await prisma.marketingPost.findMany();
    console.log(JSON.stringify(posts, null, 2));
    await prisma.$disconnect();
    await pool.end();
}
main().catch(err => {
    console.error(err);
});
//# sourceMappingURL=query.js.map