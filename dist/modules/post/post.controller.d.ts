import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    getPosts(): Promise<import("./post.entity").Post[]>;
    getPostsByUser(userId: string): Promise<import("./post.entity").Post[]>;
    createPost(authorizationHeader: string | undefined, body: CreatePostDto): Promise<import("./post.entity").Post>;
}
