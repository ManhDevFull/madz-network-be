import { BadRequestException, Injectable } from '@nestjs/common';
import { Friendship } from './entities/friend.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friendship)
    private friendRepo: Repository<Friendship>
  ) { }
  async createRequestFriend(userId: string, targetId: string) {
    const existing = await this.friendRepo.findOne({
      where: [
        { requester_id: userId, addressee_id: targetId },
        { requester_id: targetId, addressee_id: userId },
      ],
    });

    if (existing) {
      if (existing.status === 0) {

        if (existing.addressee_id === userId) {
          existing.status = 1;
          return this.friendRepo.save(existing);
        }
        throw new BadRequestException('Request already pending');
      }
      if (existing.status === 1) {
        throw new BadRequestException('Already friends');
      }
    }
    const friend = this.friendRepo.create({
      requester_id: userId,
      addressee_id: targetId,
      status: 0,
    });

    return this.friendRepo.save(friend);
  }
}