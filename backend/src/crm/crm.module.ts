import { Module } from '@nestjs/common';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [DocumentModule],
  providers: [CrmService],
  controllers: [CrmController],
})
export class CrmModule {}
