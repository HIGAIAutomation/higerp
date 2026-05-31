"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const Handlebars = __importStar(require("handlebars"));
require("dotenv/config");
const prisma = new client_1.PrismaClient();
async function main() {
    const tenantId = '00000000-0000-0000-0000-000000000000';
    const leads = await prisma.lead.findMany({
        where: { tenantId }
    });
    console.log(`Found ${leads.length} leads to update.`);
    const templateName = 'Client Requirement Document';
    const template = await prisma.documentTemplate.findFirst({
        where: { name: templateName, tenantId },
        orderBy: { createdAt: 'desc' }
    });
    if (!template) {
        console.error(`Template "${templateName}" not found in database!`);
        return;
    }
    const deleted = await prisma.generatedDocument.deleteMany({
        where: {
            tenantId,
            templateId: template.id,
            entityType: 'LEAD'
        }
    });
    console.log(`Deleted ${deleted.count} old lead requirement documents.`);
    for (const lead of leads) {
        console.log(`Compiling CRD for lead: "${lead.companyName}"...`);
        const meta = lead.metadata || {};
        const quoteData = {
            uniqueId: lead.uniqueId,
            companyName: lead.companyName,
            contact: lead.contact,
            source: lead.source,
            interestedService: lead.interestedService || 'Custom AI Solution',
            requirements: lead.requirements || 'N/A',
            isWebApp: meta.category === 'Web/App Development',
            isDigitalMarketing: meta.category === 'Digital Marketing',
            modules: meta.modules || [],
            reelsCount: meta.reelsCount || 0,
            postersCount: meta.postersCount || 0,
            brandingKits: meta.brandingKits || 'No',
            marketingPlatforms: meta.platforms || 'N/A',
            generatedAt: new Date().toLocaleDateString()
        };
        if (!Handlebars.helpers['or']) {
            Handlebars.registerHelper('or', function (a, b) {
                return a || b;
            });
        }
        const compiledTemplate = Handlebars.compile(template.contentHtml);
        const contentHtml = compiledTemplate(quoteData);
        await prisma.generatedDocument.create({
            data: {
                tenantId,
                templateId: template.id,
                entityType: 'LEAD',
                entityId: lead.id,
                status: 'generated',
                filePath: 'path/to/generated/doc.html',
                compiledHtml: contentHtml,
            }
        });
    }
    console.log('Successfully regenerated all CRDs.');
}
main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=regenerate-crd.js.map