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
exports.FollowController = void 0;
const common_1 = require("@nestjs/common");
const follow_service_1 = require("./follow.service");
const jwt_1 = require("@nestjs/jwt");
let FollowController = class FollowController {
    followService;
    jwtService;
    constructor(followService, jwtService) {
        this.followService = followService;
        this.jwtService = jwtService;
    }
    async toggleFollow(authorizationHeader, targetId) {
        const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();
        if (!token) {
            throw new common_1.UnauthorizedException('Missing bearer token');
        }
        const payload = await this.jwtService.verifyAsync(token);
        return this.followService.toggleFollow(payload.sub, targetId);
    }
};
exports.FollowController = FollowController;
__decorate([
    (0, common_1.Post)(':targetId'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('targetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FollowController.prototype, "toggleFollow", null);
exports.FollowController = FollowController = __decorate([
    (0, common_1.Controller)('follow'),
    __metadata("design:paramtypes", [follow_service_1.FollowService,
        jwt_1.JwtService])
], FollowController);
//# sourceMappingURL=follow.controller.js.map