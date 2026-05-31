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
    const projects = await prisma.project.findMany({
        where: { tenantId },
        include: { client: true }
    });
    console.log(`Found ${projects.length} projects to update.`);
    const lifecycleDocs = [
        'Non-Disclosure Agreement (NDA) - Client',
        'Master Service Agreement (MSA)',
        'Statement of Work (SOW)',
        'Service Level Agreement (SLA)',
        'Project Proposal',
        'Intellectual Property Agreement',
        'Data Processing Agreement (DPA)',
    ];
    for (const project of projects) {
        console.log(`Regenerating docs for project: "${project.name}" (Category: ${project.category})...`);
        await prisma.generatedDocument.deleteMany({
            where: { entityId: project.id, entityType: 'PROJECT', tenantId }
        });
        const compileData = {
            projectName: project.name,
            clientName: project.clientName || project.client?.username || 'Valued Client',
            companyName: 'HIG AI Automation LLP',
            startDate: project.startDate ? new Date(project.startDate).toLocaleDateString() : '____________',
            endDate: project.endDate ? new Date(project.endDate).toLocaleDateString() : '____________',
            price: project.price ? `₹${project.price.toLocaleString('en-IN')}` : '₹6,000.00',
            postCount: project.postCount || 15,
            videoCount: project.videoCount || 6,
            isWebProject: project.category === 'Web/App Development',
            isDigitalMarketing: project.category === 'Digital Marketing',
            isAutomation: project.category === 'Automation',
            isAiDevelopment: project.category === 'AI Development',
            moduleDetails: project.moduleDetails || [],
            projectInclusions: project.projectInclusions || '',
            inclusions: project.projectInclusions ? project.projectInclusions.split(/[,\n]+/).map((x) => x.trim()).filter(Boolean) : [],
        };
        for (const docName of lifecycleDocs) {
            const template = await prisma.documentTemplate.findFirst({
                where: { name: docName, tenantId },
                orderBy: { createdAt: 'desc' }
            });
            if (!template) {
                console.warn(`Template "${docName}" not found!`);
                continue;
            }
            if (!Handlebars.helpers['or']) {
                Handlebars.registerHelper('or', function (a, b) {
                    return a || b;
                });
            }
            const compiledTemplate = Handlebars.compile(template.contentHtml);
            const contentHtml = compiledTemplate(compileData);
            await prisma.generatedDocument.create({
                data: {
                    tenantId,
                    templateId: template.id,
                    entityType: 'PROJECT',
                    entityId: project.id,
                    status: 'generated',
                    filePath: 'path/to/generated/doc.html',
                    compiledHtml: contentHtml,
                }
            });
        }
    }
    console.log('All documents successfully regenerated.');
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
//# sourceMappingURL=regenerate-all-docs.js.map