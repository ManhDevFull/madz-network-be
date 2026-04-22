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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../user/entities/user.entity");
let AuthService = class AuthService {
    userRepo;
    jwtService;
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }
    async register(email, username, password) {
        email = email.toLowerCase().trim();
        username = username.trim();
        const exitUser = await this.userRepo.findOne({
            where: { email },
        });
        if (exitUser) {
            throw new common_1.UnauthorizedException('Email already exists');
        }
        const hashed = await bcrypt.hash(password, 10);
        const slug = await this.generateUniqueSlug(username);
        const user = this.userRepo.create({
            email,
            username,
            slug,
            password_hash: hashed,
        });
        const savedUser = await this.userRepo.save(user);
        const token = this.jwtService.sign({
            sub: savedUser.id,
            email: savedUser.email,
        });
        return {
            message: 'register success',
            access_token: token
        };
    }
    async login(email, password) {
        const user = await this.userRepo.findOne({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email');
        }
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            throw new common_1.UnauthorizedException('Wrong password');
        }
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
        });
        return {
            access_token: token,
        };
    }
    async generateUniqueSlug(username) {
        const baseSlug = slugify(username);
        for (let attempt = 0; attempt < 10; attempt += 1) {
            const suffix = attempt === 0 ? randomSlugSuffix() : `${randomSlugSuffix()}${attempt}`;
            const candidate = `${baseSlug}-${suffix}`.slice(0, 80);
            const existingUser = await this.userRepo.findOne({
                where: { slug: candidate },
            });
            if (!existingUser) {
                return candidate;
            }
        }
        throw new common_1.ConflictException('Could not generate unique slug');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
function slugify(value) {
    const normalized = value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
    return normalized || 'user';
}
function randomSlugSuffix() {
    return Math.random().toString(36).slice(2, 6);
}
//# sourceMappingURL=auth.service.js.map