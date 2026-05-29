"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const posts = await prisma.marketingPost.findMany();
    console.log(JSON.stringify(posts, null, 2));
    await prisma.$disconnect();
}
main().catch(err => {
    console.error(err);
});
//# sourceMappingURL=query.js.map