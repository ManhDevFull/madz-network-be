import { Controller, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtService } from '@nestjs/jwt';

@Controller('follow')
export class FollowController {
  constructor(
    private readonly followService: FollowService,
    private readonly jwtService: JwtService,
  ) {}

  @Post(':targetId')
  async toggleFollow(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Param('targetId') targetId: string,
  ) {
    const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      email: string;
    }>(token);

    return this.followService.toggleFollow(payload.sub, targetId);
  }
}
