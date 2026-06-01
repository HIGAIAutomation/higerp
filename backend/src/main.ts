import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  app.enableCors();
  // Increase body size limit for large payloads
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  // Serve static files from the public/ directory (e.g. /logo.png)
  app.useStaticAssets(join(__dirname, '..', 'public'));
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
