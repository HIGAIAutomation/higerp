"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Cleaning up duplicate document templates...');
    const templates = await prisma.documentTemplate.findMany({
        orderBy: { createdAt: 'desc' }
    });
    const seenTemplates = new Set();
    const duplicateTemplateIds = [];
    for (const t of templates) {
        const key = `${t.tenantId}-${t.name}`;
        if (seenTemplates.has(key)) {
            duplicateTemplateIds.push(t.id);
        }
        else {
            seenTemplates.add(key);
        }
    }
    console.log(`Found ${duplicateTemplateIds.length} duplicate templates to delete.`);
    if (duplicateTemplateIds.length > 0) {
        for (let i = 0; i < duplicateTemplateIds.length; i += 100) {
            const chunk = duplicateTemplateIds.slice(i, i + 100);
            await prisma.documentTemplate.deleteMany({
                where: { id: { in: chunk } }
            });
        }
    }
    console.log('Cleaning up duplicate generated documents...');
    const genDocs = await prisma.generatedDocument.findMany({
        include: { template: true },
        orderBy: { createdAt: 'desc' }
    });
    const seenGenDocs = new Set();
    const duplicateGenDocIds = [];
    for (const doc of genDocs) {
        if (!doc.template)
            continue;
        const key = `${doc.tenantId}-${doc.entityId}-${doc.template.name}`;
        if (seenGenDocs.has(key)) {
            duplicateGenDocIds.push(doc.id);
        }
        else {
            seenGenDocs.add(key);
        }
    }
    console.log(`Found ${duplicateGenDocIds.length} duplicate generated documents to delete.`);
    if (duplicateGenDocIds.length > 0) {
        for (let i = 0; i < duplicateGenDocIds.length; i += 100) {
            const chunk = duplicateGenDocIds.slice(i, i + 100);
            await prisma.generatedDocument.deleteMany({
                where: { id: { in: chunk } }
            });
        }
    }
    console.log('Cleaning up mismatched category documents...');
    const projects = await prisma.project.findMany();
    for (const project of projects) {
        const projectDocs = await prisma.generatedDocument.findMany({
            where: { entityId: project.id },
            include: { template: true }
        });
        const isDM = project.category === 'Digital Marketing';
        const docsToDelete = [];
        for (const doc of projectDocs) {
            if (!doc.template)
                continue;
            const name = doc.template.name;
            if (isDM) {
                if (name === 'Non-Disclosure Agreement (NDA) - Client' || name === 'Master Service Agreement (MSA)' || name === 'Statement of Work (SOW)') {
                    docsToDelete.push(doc.id);
                }
            }
            else {
                if (name === 'Non-Disclosure Agreement (NDA) - Digital Marketing' || name === 'Master Service Agreement (MSA) - Digital Marketing' || name === 'Statement of Work (SOW) - Digital Marketing') {
                    docsToDelete.push(doc.id);
                }
            }
        }
        if (docsToDelete.length > 0) {
            console.log(`Deleting ${docsToDelete.length} mismatched category documents for project ${project.id}`);
            await prisma.generatedDocument.deleteMany({
                where: { id: { in: docsToDelete } }
            });
        }
    }
    console.log('Cleanup complete!');
}
main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=cleanup-duplicates.js.map