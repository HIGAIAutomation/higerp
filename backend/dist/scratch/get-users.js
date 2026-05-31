"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
prisma.user.findMany().then(console.log);
//# sourceMappingURL=get-users.js.map