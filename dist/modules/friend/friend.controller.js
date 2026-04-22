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
exports.FriendController = void 0;
const common_1 = require("@nestjs/common");
const friend_service_1 = require("./friend.service");
const jwt_service_1 = require("@nestjs/jwt/dist/jwt.service");
let FriendController = class FriendController {
    friendService;
    jwtService;
    constructor(friendService, jwtService) {
        this.friendService = friendService;
        this.jwtService = jwtService;
    }
    async create(authorizationHeader, targetId) {
        const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();
        if (!token) {
            throw new common_1.UnauthorizedException('Missing bearer token');
        }
        const payload = await this.jwtService.verifyAsync(token);
        if (payload.sub === targetId) {
            throw new common_1.UnauthorizedException('Cannot send friend request to yourself');
        }
        return this.friendService.createRequestFriend(payload.sub, targetId);
    }
};
exports.FriendController = FriendController;
__decorate([
    (0, common_1.Post)('request/:targetId'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FriendController.prototype, "create", null);
exports.FriendController = FriendController = __decorate([
    (0, common_1.Controller)('friend'),
    __metadata("design:paramtypes", [friend_service_1.FriendService,
        jwt_service_1.JwtService])
], FriendController);
//# sourceMappingURL=friend.controller.js.map