"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Fetching generated documents...');
    const docs = await prisma.generatedDocument.findMany();
    console.log(`Found ${docs.length} documents.`);
    let updatedCount = 0;
    for (const doc of docs) {
        if (!doc.compiledHtml)
            continue;
        let updatedHtml = doc.compiledHtml;
        const oldHeader = `.header-branding {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    padding-bottom: 12px;
  }`;
        const newHeader = `.header-branding {
    width: 100%;
    clear: both;
    display: block;
    padding-bottom: 12px;
  }
  
  .header-branding::after {
    content: "";
    display: table;
    clear: both;
  }
  
  .company-logo {
    float: left;
    max-height: 48px;
    max-width: 140px;
    object-fit: contain;
  }
  
  .company-details {
    float: right;
    text-align: right;
  }`;
        const oldDivider = `.divider {
    border-bottom: 1.5px solid #e2e8f0;
    width: 100%;
  }`;
        const newDivider = `.divider {
    border-bottom: 1.5px solid #e2e8f0;
    width: 100%;
    clear: both;
    padding-top: 10px;
  }`;
        const oldTitleBlock = `.header-title-block {
    text-align: center;
    margin-top: 25px;
    margin-bottom: 35px;
  }`;
        const newTitleBlock = `.header-title-block {
    text-align: center;
    margin-top: 25px;
    margin-bottom: 35px;
    clear: both;
  }`;
        const oldSection = `.section {
    margin-bottom: 30px;
  }`;
        const newSection = `.section {
    margin-bottom: 30px;
    clear: both;
  }`;
        const oldSignatures = `.signatures {
    margin-top: 50px;
    display: flex;
    justify-content: space-between;
    page-break-inside: avoid;
    gap: 40px;
  }
  
  .sig-col {
    width: 48%;
    font-size: 12px;
  }`;
        const newSignatures = `.signatures {
    margin-top: 50px;
    width: 100%;
    clear: both;
    display: block;
    page-break-inside: avoid;
  }
  
  .signatures::after {
    content: "";
    display: table;
    clear: both;
  }
  
  .sig-col {
    float: left;
    width: 45%;
    font-size: 12px;
  }
  
  .sig-col:last-child {
    float: right;
    width: 45%;
  }`;
        updatedHtml = updatedHtml.replace(oldHeader, newHeader);
        updatedHtml = updatedHtml.replace(oldDivider, newDivider);
        updatedHtml = updatedHtml.replace(oldTitleBlock, newTitleBlock);
        updatedHtml = updatedHtml.replace(oldSection, newSection);
        updatedHtml = updatedHtml.replace(oldSignatures, newSignatures);
        if (updatedHtml !== doc.compiledHtml) {
            await prisma.generatedDocument.update({
                where: { id: doc.id },
                data: { compiledHtml: updatedHtml },
            });
            updatedCount++;
        }
    }
    console.log(`Successfully migrated ${updatedCount} generated documents to new styling.`);
    await prisma.$disconnect();
}
main().catch(err => {
    console.error(err);
});
//# sourceMappingURL=update-docs.js.map