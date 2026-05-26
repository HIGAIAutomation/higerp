import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [DocumentModule],
  providers: [ProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}
