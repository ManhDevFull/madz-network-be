import { Controller, Post, Body, Get, Headers, Patch, Query, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return this.userService.login(email, password);
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    return this.userService.getMe(authorization);
  }

  @Get('search')
  async searchUsers(
    @Headers('authorization') authorization?: string,
    @Query('q') query?: string,
  ) {
    return this.userService.searchUsers(query, authorization);
  }

  @Get(':slug')
  async getUserProfile(
    @Param('slug') slug: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.userService.getPublicProfile(slug, authorization);
  }

  @Patch('me')
  async updateMe(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: UpdateUserDto,
  ) {
    return this.userService.updateMe(authorization, body);
  }
}
