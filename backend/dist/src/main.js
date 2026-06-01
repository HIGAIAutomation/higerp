"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express_1 = require("express");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bodyParser: false });
    app.enableCors();
    app.use((0, express_1.json)({ limit: '50mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '50mb' }));
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map