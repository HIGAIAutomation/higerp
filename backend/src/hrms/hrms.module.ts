import { Module } from '@nestjs/common';
import { HrmsService } from './hrms.service';
import { HrmsController } from './hrms.controller';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [DocumentModule],
  providers: [HrmsService],
  controllers: [HrmsController],
  exports: [HrmsService],
})
export class HrmsModule {}
