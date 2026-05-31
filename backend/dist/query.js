"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const docs = await prisma.generatedDocument.findMany({
        include: { template: true }
    });
    console.log("=== Generated Documents ===");
    console.log(JSON.stringify(docs.map(d => ({
        id: d.id,
        entityId: d.entityId,
        entityType: d.entityType,
        status: d.status,
        templateName: d.template?.name,
        hasHtml: !!d.compiledHtml,
        tenantId: d.tenantId
    })), null, 2));
    await prisma.$disconnect();
}
main().catch(err => {
    console.error(err);
});
//# sourceMappingURL=query.js.map