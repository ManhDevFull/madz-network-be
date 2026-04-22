import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    private jwtService: JwtService,
  ) { }
  async register(email: string, username: string, password: string) {
    email = email.toLowerCase().trim();
    username = username.trim();
    const exitUser = await this.userRepo.findOne({
      where: { email },
    });
    if (exitUser) {
      throw new UnauthorizedException('Email already exists');
    }
    const hashed = await bcrypt.hash(password, 10);
    const slug = await this.generateUniqueSlug(username);

    const user = this.userRepo.create({
      email,
      username,
      slug,
      password_hash: hashed,
    });
    const savedUser = await this.userRepo.save(user);
    const token = this.jwtService.sign({
      sub: savedUser.id,
      email: savedUser.email,
    });
    return {
      message: 'register success',
      access_token: token
    };
  }
  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new UnauthorizedException('Wrong password');
    }
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    return {
      access_token: token,
    };
  }

  private async generateUniqueSlug(username: string) {
    const baseSlug = slugify(username);

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const suffix =
        attempt === 0 ? randomSlugSuffix() : `${randomSlugSuffix()}${attempt}`;
      const candidate = `${baseSlug}-${suffix}`.slice(0, 80);

      const existingUser = await this.userRepo.findOne({
        where: { slug: candidate },
      });

      if (!existingUser) {
        return candidate;
      }
    }

    throw new ConflictException('Could not generate unique slug');
  }
}

function slugify(value: string) {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return normalized || 'user';
}

function randomSlugSuffix() {
  return Math.random().toString(36).slice(2, 6);
}
