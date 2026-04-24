import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Follow } from './entities/follow.entity';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private followRepo: Repository<Follow>,
  ) {}

  async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const existingFollow = await this.followRepo.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    if (existingFollow) {
      await this.followRepo.remove(existingFollow);

      return {
        follower_id: followerId,
        following_id: followingId,
        is_following: false,
      };
    }

    const follow = this.followRepo.create({
      follower_id: followerId,
      following_id: followingId,
    });

    const savedFollow = await this.followRepo.save(follow);

    return {
      follower_id: savedFollow.follower_id,
      following_id: savedFollow.following_id,
      is_following: true,
    };
  }
}
