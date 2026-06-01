"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async validateUser(username, pass, tenantId = '00000000-0000-0000-0000-000000000000') {
        const user = await this.prisma.user.findFirst({
            where: {
                tenantId,
                OR: [
                    { username },
                    { email: username }
                ]
            },
        });
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = { username: user.username, sub: user.id, tenantId: user.tenantId, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                tenantId: user.tenantId,
                dob: user.dob,
                address: user.address,
                whatsappNumber: user.whatsappNumber,
                designation: user.designation,
                salary: user.salary,
                pageAccess: user.pageAccess,
            },
        };
    }
    async register(data) {
        const tenantId = data.tenantId || '00000000-0000-0000-0000-000000000000';
        const existingUser = await this.prisma.user.findFirst({
            where: { username: data.username, tenantId },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Username is already taken');
        }
        const count = await this.prisma.user.count({
            where: { tenantId },
        });
        const isFirstUser = count === 0;
        const role = isFirstUser ? 'superadmin' : 'user';
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                username: data.username,
                password: hashedPassword,
                dob: data.dob || null,
                address: data.address || null,
                tenantId,
                role,
                pageAccess: isFirstUser ? ['*'] : [],
            },
        });
        const { password, ...result } = user;
        return result;
    }
    async getAllUsers(tenantId) {
        return this.prisma.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                dob: true,
                address: true,
                designation: true,
                salary: true,
                pageAccess: true,
                createdAt: true,
            },
        });
    }
    async updateUserAccess(userId, tenantId, data) {
        const updateData = {};
        if (data.designation !== undefined)
            updateData.designation = data.designation;
        if (data.salary !== undefined) {
            updateData.salary = data.salary === null || data.salary === '' ? null : Number(data.salary);
        }
        if (data.pageAccess !== undefined)
            updateData.pageAccess = data.pageAccess;
        if (data.role !== undefined)
            updateData.role = data.role;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.dob !== undefined)
            updateData.dob = data.dob;
        if (data.address !== undefined)
            updateData.address = data.address;
        const user = await this.prisma.user.update({
            where: { id: userId, tenantId },
            data: updateData,
        });
        const { password, ...result } = user;
        return result;
    }
    async getUserById(userId, tenantId) {
        return this.prisma.user.findFirst({
            where: { id: userId, tenantId },
        });
    }
    async updateProfile(userId, tenantId, data) {
        const updateData = {};
        if (data.username !== undefined)
            updateData.username = data.username;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.dob !== undefined)
            updateData.dob = data.dob;
        if (data.address !== undefined)
            updateData.address = data.address;
        if (data.whatsappNumber !== undefined)
            updateData.whatsappNumber = data.whatsappNumber;
        if (data.phone !== undefined)
            updateData.whatsappNumber = data.phone;
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }
        const user = await this.prisma.user.update({
            where: { id: userId, tenantId },
            data: updateData,
        });
        const { password, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map