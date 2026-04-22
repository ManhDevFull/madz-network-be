import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { IsNull, Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
    private jwtService: JwtService,
  ) {}

  async findAll() {
    return this.postRepo.find({
      where: {
        deleted_at: IsNull(),
        post_type: 0,
      },
      order: { created_at: 'DESC' },
      take: 20,
    });
  }

  async findByUserId(userId: string) {
    return this.postRepo.find({
      where: {
        deleted_at: IsNull(),
        post_type: 0,
        user_id: userId,
      },
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async createPost(authorizationHeader: string | undefined, body: CreatePostDto) {
    const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      email: string;
    }>(token);

    const content = body.content?.trim() ?? '';
    const mediaUrl = body.media_url?.trim() ?? null;

    if (!content && !mediaUrl) {
      throw new BadRequestException('Post must include content or media_url');
    }

    const post = this.postRepo.create({
      user_id: payload.sub,
      content: content || null,
      media_url: mediaUrl,
      post_type: 0,
      parent_post_id: null,
      root_post_id: null,
      like_count: 0,
      comment_count: 0,
      visibility: body.visibility ?? 0,
    });

    return this.postRepo.save(post);
  }
}
