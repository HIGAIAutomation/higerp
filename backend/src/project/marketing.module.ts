import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MarketingService],
  controllers: [MarketingController],
  exports: [MarketingService],
})
export class MarketingModule {}
