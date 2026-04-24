import { FollowService } from './follow.service';
import { JwtService } from '@nestjs/jwt';
export declare class FollowController {
    private readonly followService;
    private readonly jwtService;
    constructor(followService: FollowService, jwtService: JwtService);
    toggleFollow(authorizationHeader: string | undefined, targetId: string): Promise<{
        follower_id: string;
        following_id: string;
        is_following: boolean;
    }>;
}
