import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AUTH_JWT_SECRET } from '../auth/auth.constants';
import { Friendship } from '../friend/entities/friend.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Friendship]),
    JwtModule.register({
      secret: AUTH_JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
