import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { AUTH_JWT_SECRET } from '../auth/auth.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    JwtModule.register({
      secret: AUTH_JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
