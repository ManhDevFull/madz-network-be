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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("@nestjs/typeorm");
const friend_entity_1 = require("../friend/entities/friend.entity");
let UserService = class UserService {
    userRepo;
    friendshipRepo;
    jwtService;
    constructor(userRepo, friendshipRepo, jwtService) {
        this.userRepo = userRepo;
        this.friendshipRepo = friendshipRepo;
        this.jwtService = jwtService;
    }
    async login(email, password) {
        return this.userRepo.findOneBy({ email, password_hash: password });
    }
    async getMe(authorizationHeader) {
        const user = await this.resolveUserFromAuthorization(authorizationHeader);
        return this.buildProfileResponse(user, true, user);
    }
    async getPublicProfile(userSlug, authorizationHeader) {
        const user = await this.userRepo.findOne({
            where: { slug: userSlug },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        let currentUser = null;
        try {
            currentUser = await this.resolveUserFromAuthorization(authorizationHeader);
        }
        catch {
            currentUser = null;
        }
        return this.buildProfileResponse(user, false, currentUser);
    }
    async updateMe(authorizationHeader, body) {
        const user = await this.resolveUserFromAuthorization(authorizationHeader);
        if (body.slug !== undefined) {
            const normalizedSlug = normalizeSlug(body.slug);
            if (!normalizedSlug) {
                throw new common_1.ConflictException('Slug is invalid');
            }
            const existingUser = await this.userRepo.findOne({
                where: { slug: normalizedSlug },
            });
            if (existingUser && existingUser.id !== user.id) {
                throw new common_1.ConflictException('Slug already exists');
            }
            user.slug = normalizedSlug;
        }
        user.gender =
            body.gender === undefined || body.gender === null ? null : body.gender;
        user.hometown = body.hometown?.trim() ? body.hometown.trim() : null;
        const savedUser = await this.userRepo.save(user);
        return this.buildProfileResponse(savedUser, true, savedUser);
    }
    async searchUsers(query, authorizationHeader) {
        const keyword = query?.trim();
        if (!keyword) {
            return [];
        }
        let currentUserId = null;
        try {
            const currentUser = await this.resolveUserFromAuthorization(authorizationHeader);
            currentUserId = currentUser.id;
        }
        catch {
            currentUserId = null;
        }
        const users = await this.userRepo
            .createQueryBuilder('user')
            .select([
            'user.id',
            'user.slug',
            'user.username',
            'user.avatar_url',
            'user.bio',
        ])
            .where(currentUserId ? 'user.id <> :currentUserId' : '1=1', {
            currentUserId,
        })
            .orderBy('user.created_at', 'DESC')
            .limit(60)
            .getMany();
        const normalizedKeyword = normalizeSearchText(keyword);
        return users
            .map((user) => ({
            id: user.id,
            slug: user.slug,
            username: user.username,
            avatar_url: user.avatar_url ?? null,
            bio: user.bio ?? null,
            score: scoreSearchUser(user.username, user.slug, normalizedKeyword),
        }))
            .filter((user) => user.score > 0)
            .sort((left, right) => right.score - left.score)
            .slice(0, 6)
            .map(({ score: _score, ...user }) => user);
    }
    async resolveUserFromAuthorization(authorizationHeader) {
        const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();
        if (!token) {
            throw new common_1.UnauthorizedException('Missing bearer token');
        }
        const payload = await this.jwtService.verifyAsync(token);
        const user = await this.userRepo.findOne({
            where: { id: payload.sub },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async buildProfileResponse(user, includeEmail, currentUser) {
        const [postCountResult, followerCountResult, followingCountResult] = await Promise.all([
            this.userRepo.query(`
            SELECT COUNT(*)::int AS count
            FROM posts
            WHERE user_id = $1
              AND post_type = 0
              AND deleted_at IS NULL
          `, [user.id]),
            this.userRepo.query(`
            SELECT COUNT(*)::int AS count
            FROM follows
            WHERE following_id = $1
          `, [user.id]),
            this.userRepo.query(`
            SELECT COUNT(*)::int AS count
            FROM follows
            WHERE follower_id = $1
          `, [user.id]),
        ]);
        const friendship = currentUser
            ? await this.friendshipRepo.findOne({
                where: [
                    { requester_id: currentUser.id, addressee_id: user.id },
                    { requester_id: user.id, addressee_id: currentUser.id },
                ],
            })
            : null;
        return {
            id: user.id,
            slug: user.slug,
            username: user.username,
            ...(includeEmail ? { email: user.email } : {}),
            avatar_url: user.avatar_url ?? null,
            bio: user.bio ?? null,
            gender: user.gender ?? null,
            hometown: user.hometown ?? null,
            post_count: postCountResult[0]?.count ?? 0,
            follower_count: followerCountResult[0]?.count ?? 0,
            following_count: followingCountResult[0]?.count ?? 0,
            created_at: user.created_at,
            createAt: user.created_at,
            friendship_id: friendship?.id ?? null,
            friendship_status: resolveFriendshipStatus(currentUser, user, friendship),
            friendship_requested_by_me: Boolean(currentUser && friendship && friendship.requester_id === currentUser.id),
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_2.InjectRepository)(friend_entity_1.Friendship)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        jwt_1.JwtService])
], UserService);
function resolveFriendshipStatus(currentUser, targetUser, friendship) {
    if (!currentUser) {
        return null;
    }
    if (currentUser.id === targetUser.id) {
        return 'self';
    }
    if (!friendship) {
        return 'none';
    }
    switch (friendship.status) {
        case 0:
            return 'pending';
        case 1:
            return 'accepted';
        case 2:
            return 'rejected';
        case 3:
            return 'blocked';
        default:
            return 'unknown';
    }
}
function normalizeSearchText(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function normalizeSlug(value) {
    if (!value) {
        return null;
    }
    return (value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || null);
}
function scoreSearchUser(username, slug, normalizedKeyword) {
    const normalizedUsername = normalizeSearchText(username);
    const normalizedSlug = normalizeSearchText(slug);
    if (!normalizedKeyword || (!normalizedUsername && !normalizedSlug)) {
        return 0;
    }
    if (normalizedUsername === normalizedKeyword || normalizedSlug === normalizedKeyword) {
        return 100;
    }
    if (normalizedUsername.startsWith(normalizedKeyword) ||
        normalizedSlug.startsWith(normalizedKeyword)) {
        return 90;
    }
    if (normalizedUsername.includes(normalizedKeyword) ||
        normalizedSlug.includes(normalizedKeyword)) {
        return 75;
    }
    const keywordParts = normalizedKeyword.split(' ').filter(Boolean);
    const usernameParts = `${normalizedUsername} ${normalizedSlug}`
        .split(' ')
        .filter(Boolean);
    const matchedParts = keywordParts.filter((part) => usernameParts.some((usernamePart) => usernamePart.includes(part))).length;
    if (matchedParts === keywordParts.length && matchedParts > 0) {
        return 60 + matchedParts;
    }
    if (matchedParts > 0) {
        return 30 + matchedParts;
    }
    return 0;
}
//# sourceMappingURL=user.service.js.map