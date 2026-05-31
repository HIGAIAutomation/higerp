import { Controller, Get, Post, Body, Param, UseGuards, Request, Res } from '@nestjs/common';
import { DocumentService } from './document.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('document')
@UseGuards(AuthGuard('jwt'))
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Get('entity/:entityType/:entityId')
  async getDocumentsForEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Request() req: any,
  ) {
    return this.documentService.getDocumentsForEntity(
      req.user.tenantId,
      entityId,
      entityType.toUpperCase(),
    );
  }

  @Get('/:id/download')
  async downloadDocument(@Param('id') id: string, @Request() req: any, @Res() res: any) {
    const doc = await this.documentService.getDocument(req.user.tenantId, id);
    if (!doc || !doc.compiledHtml) {
      res.status(404).send('Document not found or compiled layout is empty.');
      return;
    }
    const filename = `${doc.template?.name || 'document'}.html`.replace(/\s+/g, '_');
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(doc.compiledHtml);
  }

  @Get('/:id/pdf')
  async downloadPdf(@Param('id') id: string, @Request() req: any, @Res() res: any) {
    try {
      const pdfBuffer = await this.documentService.generatePdf(req.user.tenantId, id);
      const doc = await this.documentService.getDocument(req.user.tenantId, id);
      const filename = `${doc?.template?.name || 'document'}.pdf`.replace(/\s+/g, '_');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('Error in downloadPdf:', error);
      res.status(500).send(`Failed to generate PDF: ${error.message}`);
    }
  }

  @Post('/render-pdf')
  async renderPdf(@Body() body: { htmlContent: string, filename?: string }, @Res() res: any) {
    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      try {
        const page = await browser.newPage();
        await page.setContent(body.htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
          format: 'Letter',
          margin: {
            top: '20mm',
            bottom: '20mm',
            left: '20mm',
            right: '20mm',
          },
          printBackground: true,
        });

        const filename = (body.filename || 'report.pdf').replace(/\s+/g, '_');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(Buffer.from(pdfBuffer));
      } finally {
        await browser.close();
      }
    } catch (error: any) {
      console.error('Error in renderPdf:', error);
      res.status(500).send(`Failed to render PDF: ${error.message}`);
    }
  }

  @Get('/:id')
  async getDocument(@Param('id') id: string, @Request() req: any) {
    return this.documentService.getDocument(req.user.tenantId, id);
  }

  @Post('/:id/sign')
  async signDocument(@Param('id') id: string, @Body() body: { signatureData: string }, @Request() req: any) {
    if (!body.signatureData) {
      throw new Error('Signature data is required');
    }
    try {
      return await this.documentService.signDocument(req.user.tenantId, id, body.signatureData);
    } catch (error: any) {
      console.error('Error signing document in backend:', error);
      throw error;
    }
  }
}
