"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const doc = await prisma.generatedDocument.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { template: true }
    });
    if (doc) {
        console.log("=== Compiled HTML ===");
        console.log(doc.compiledHtml);
    }
    else {
        console.log("No document found.");
    }
    await prisma.$disconnect();
}
main().catch(err => {
    console.error(err);
});
//# sourceMappingURL=query.js.map