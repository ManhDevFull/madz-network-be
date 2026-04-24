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
exports.FollowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const follow_entity_1 = require("./entities/follow.entity");
let FollowService = class FollowService {
    followRepo;
    constructor(followRepo) {
        this.followRepo = followRepo;
    }
    async toggleFollow(followerId, followingId) {
        if (followerId === followingId) {
            throw new common_1.BadRequestException('Cannot follow yourself');
        }
        const existingFollow = await this.followRepo.findOne({
            where: {
                follower_id: followerId,
                following_id: followingId,
            },
        });
        if (existingFollow) {
            await this.followRepo.remove(existingFollow);
            return {
                follower_id: followerId,
                following_id: followingId,
                is_following: false,
            };
        }
        const follow = this.followRepo.create({
            follower_id: followerId,
            following_id: followingId,
        });
        const savedFollow = await this.followRepo.save(follow);
        return {
            follower_id: savedFollow.follower_id,
            following_id: savedFollow.following_id,
            is_following: true,
        };
    }
};
exports.FollowService = FollowService;
exports.FollowService = FollowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(follow_entity_1.Follow)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FollowService);
//# sourceMappingURL=follow.service.js.map