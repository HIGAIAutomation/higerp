"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
require("dotenv/config");
const connectionString = "postgres://postgres:postgres@127.0.0.1:51214/template1?sslmode=disable";
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
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