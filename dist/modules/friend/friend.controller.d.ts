import { FriendService } from './friend.service';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
export declare class FriendController {
    private readonly friendService;
    private jwtService;
    constructor(friendService: FriendService, jwtService: JwtService);
    create(authorizationHeader: string | undefined, targetId: string): Promise<import("./entities/friend.entity").Friendship>;
}
