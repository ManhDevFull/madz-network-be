import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
export declare class FollowService {
    private followRepo;
    constructor(followRepo: Repository<Follow>);
    toggleFollow(followerId: string, followingId: string): Promise<{
        follower_id: string;
        following_id: string;
        is_following: boolean;
    }>;
}
