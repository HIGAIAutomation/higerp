"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
require("dotenv/config");
const prisma = new client_1.PrismaClient();
async function main() {
    const docs = await prisma.generatedDocument.findMany({
        include: { template: true }
    });
    console.log(`TOTAL DOCUMENTS IN DB: ${docs.length}`);
    for (const doc of docs) {
        console.log(`- ID: ${doc.id}`);
        console.log(`  Name: ${doc.template?.name || 'Unknown'}`);
        console.log(`  EntityId: ${doc.entityId}`);
        console.log(`  EntityType: ${doc.entityType}`);
        console.log(`  Compiled HTML Length: ${doc.compiledHtml?.length ?? 'null'}`);
    }
}
main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=check_docs.js.map