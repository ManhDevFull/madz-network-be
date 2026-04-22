import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friendship } from './entities/friend.entity';
import { AUTH_JWT_SECRET } from '../auth/auth.constants';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friendship]),
    JwtModule.register({
      secret: AUTH_JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [FriendController],
  providers: [FriendService],
})
export class FriendModule { }
