import { Friendship } from './entities/friend.entity';
import { Repository } from 'typeorm';
export declare class FriendService {
    private friendRepo;
    constructor(friendRepo: Repository<Friendship>);
    createRequestFriend(userId: string, targetId: string): Promise<Friendship>;
}
