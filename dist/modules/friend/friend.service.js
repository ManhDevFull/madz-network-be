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
exports.FriendService = void 0;
const common_1 = require("@nestjs/common");
const friend_entity_1 = require("./entities/friend.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let FriendService = class FriendService {
    friendRepo;
    constructor(friendRepo) {
        this.friendRepo = friendRepo;
    }
    async createRequestFriend(userId, targetId) {
        const existing = await this.friendRepo.findOne({
            where: [
                { requester_id: userId, addressee_id: targetId },
                { requester_id: targetId, addressee_id: userId },
            ],
        });
        if (existing) {
            if (existing.status === 0) {
                if (existing.addressee_id === userId) {
                    existing.status = 1;
                    return this.friendRepo.save(existing);
                }
                throw new common_1.BadRequestException('Request already pending');
            }
            if (existing.status === 1) {
                throw new common_1.BadRequestException('Already friends');
            }
        }
        const friend = this.friendRepo.create({
            requester_id: userId,
            addressee_id: targetId,
            status: 0,
        });
        return this.friendRepo.save(friend);
    }
};
exports.FriendService = FriendService;
exports.FriendService = FriendService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(friend_entity_1.Friendship)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FriendService);
//# sourceMappingURL=friend.service.js.map