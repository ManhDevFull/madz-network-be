"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const typeorm_2 = require("typeorm");
const post_entity_1 = require("./post.entity");
let PostService = class PostService {
    postRepo;
    jwtService;
    constructor(postRepo, jwtService) {
        this.postRepo = postRepo;
        this.jwtService = jwtService;
    }
    async findAll() {
        return this.postRepo.find({
            where: {
                deleted_at: (0, typeorm_2.IsNull)(),
                post_type: 0,
            },
            order: { created_at: 'DESC' },
            take: 20,
        });
    }
    async findByUserId(userId) {
        return this.postRepo.find({
            where: {
                deleted_at: (0, typeorm_2.IsNull)(),
                post_type: 0,
                user_id: userId,
            },
            order: { created_at: 'DESC' },
            take: 50,
        });
    }
    async createPost(authorizationHeader, body) {
        const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();
        if (!token) {
            throw new common_1.UnauthorizedException('Missing bearer token');
        }
        const payload = await this.jwtService.verifyAsync(token);
        const content = body.content?.trim() ?? '';
        const mediaUrl = body.media_url?.trim() ?? null;
        if (!content && !mediaUrl) {
            throw new common_1.BadRequestException('Post must include content or media_url');
        }
        const post = this.postRepo.create({
            user_id: payload.sub,
            content: content || null,
            media_url: mediaUrl,
            post_type: 0,
            parent_post_id: null,
            root_post_id: null,
            like_count: 0,
            comment_count: 0,
            visibility: body.visibility ?? 0,
        });
        return this.postRepo.save(post);
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], PostService);
//# sourceMappingURL=post.service.js.map