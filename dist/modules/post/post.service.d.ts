import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
export declare class PostService {
    private postRepo;
    private jwtService;
    constructor(postRepo: Repository<Post>, jwtService: JwtService);
    findAll(): Promise<Post[]>;
    findByUserId(userId: string): Promise<Post[]>;
    createPost(authorizationHeader: string | undefined, body: CreatePostDto): Promise<Post>;
}
