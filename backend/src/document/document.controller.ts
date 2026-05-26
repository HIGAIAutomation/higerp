import { Controller, Get, Param, UseGuards, Request, Res } from '@nestjs/common';
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

  @Get('/:id')
  async getDocument(@Param('id') id: string, @Request() req: any) {
    return this.documentService.getDocument(req.user.tenantId, id);
  }
}
