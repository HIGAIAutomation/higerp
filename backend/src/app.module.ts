import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './tenant/tenant.module';
import { HrmsModule } from './hrms/hrms.module';
import { DocumentModule } from './document/document.module';
import { ProjectModule } from './project/project.module';
import { CrmModule } from './crm/crm.module';
import { FinanceModule } from './finance/finance.module';
import { SupportModule } from './support/support.module';
import { AssetModule } from './asset/asset.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { MarketingModule } from './project/marketing.module';
import { PaymentModule } from './project/payment.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    TenantModule,
    HrmsModule,
    DocumentModule,
    ProjectModule,
    CrmModule,
    FinanceModule,
    SupportModule,
    AssetModule,
    KnowledgeModule,
    MarketingModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
