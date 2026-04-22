import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async getPosts() {
    return this.postService.findAll();
  }

  @Get('user/:userId')
  async getPostsByUser(@Param('userId') userId: string) {
    return this.postService.findByUserId(userId);
  }

  @Post()
  async createPost(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Body() body: CreatePostDto,
  ) {
    return this.postService.createPost(authorizationHeader, body);
  }
}
