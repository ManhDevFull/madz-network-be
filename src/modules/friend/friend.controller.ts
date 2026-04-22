import { Controller, Get, Post, Body, Headers, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { FriendService } from './friend.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Controller('friend')
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private jwtService: JwtService,
  ) { }

  @Post('request/:targetId')
  async create(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Param('targetId') targetId: string) {

    const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      email: string;
    }>(token);
    if(payload.sub === targetId) {
      throw new UnauthorizedException('Cannot send friend request to yourself');
    }
    return this.friendService.createRequestFriend(payload.sub, targetId);
  }
}
