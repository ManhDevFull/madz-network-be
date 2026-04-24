import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { JwtModule } from '@nestjs/jwt';
import { AUTH_JWT_SECRET } from '../auth/auth.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow]),
    JwtModule.register({
      secret: AUTH_JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [FollowController],
  providers: [FollowService],
})
export class FollowModule {}
