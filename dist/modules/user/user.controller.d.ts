import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    login(body: {
        email: string;
        password: string;
    }): Promise<import("./entities/user.entity").User | null>;
    me(authorization?: string): Promise<{
        avatar_url: string;
        bio: string;
        gender: number | null;
        hometown: string | null;
        post_count: any;
        follower_count: any;
        following_count: any;
        created_at: Date;
        createAt: Date;
        friendship_id: string | null;
        friendship_status: string | null;
        friendship_requested_by_me: boolean;
        email?: string | undefined;
        id: string;
        slug: string;
        username: string;
    }>;
    searchUsers(authorization?: string, query?: string): Promise<{
        id: string;
        slug: string;
        username: string;
        avatar_url: string;
        bio: string;
    }[]>;
    getUserProfile(slug: string, authorization?: string): Promise<{
        avatar_url: string;
        bio: string;
        gender: number | null;
        hometown: string | null;
        post_count: any;
        follower_count: any;
        following_count: any;
        created_at: Date;
        createAt: Date;
        friendship_id: string | null;
        friendship_status: string | null;
        friendship_requested_by_me: boolean;
        email?: string | undefined;
        id: string;
        slug: string;
        username: string;
    }>;
    updateMe(authorization: string | undefined, body: UpdateUserDto): Promise<{
        avatar_url: string;
        bio: string;
        gender: number | null;
        hometown: string | null;
        post_count: any;
        follower_count: any;
        following_count: any;
        created_at: Date;
        createAt: Date;
        friendship_id: string | null;
        friendship_status: string | null;
        friendship_requested_by_me: boolean;
        email?: string | undefined;
        id: string;
        slug: string;
        username: string;
    }>;
}
