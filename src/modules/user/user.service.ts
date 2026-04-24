import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { Friendship } from '../friend/entities/friend.entity';
import { Follow } from '../follow/entities/follow.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Friendship)
    private friendshipRepo: Repository<Friendship>,
    @InjectRepository(Follow)
    private followRepo: Repository<Follow>,
    private jwtService: JwtService,
  ) { }

  async login(email: string, password: string) {
    return this.userRepo.findOneBy({ email, password_hash: password });
  }

  async getMe(authorizationHeader?: string) {
    const user = await this.resolveUserFromAuthorization(authorizationHeader);
    return this.buildProfileResponse(user, true, user);
  }

  async getPublicProfile(userSlug: string, authorizationHeader?: string) {
    const user = await this.userRepo.findOne({
      where: { slug: userSlug as never },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let currentUser: User | null = null;

    try {
      currentUser = await this.resolveUserFromAuthorization(authorizationHeader);
    } catch {
      currentUser = null;
    }

    return this.buildProfileResponse(user, false, currentUser);
  }

  async updateMe(authorizationHeader: string | undefined, body: UpdateUserDto) {
    const user = await this.resolveUserFromAuthorization(authorizationHeader);

    if (body.slug !== undefined) {
      const normalizedSlug = normalizeSlug(body.slug);

      if (!normalizedSlug) {
        throw new ConflictException('Slug is invalid');
      }

      const existingUser = await this.userRepo.findOne({
        where: { slug: normalizedSlug },
      });

      if (existingUser && existingUser.id !== user.id) {
        throw new ConflictException('Slug already exists');
      }

      user.slug = normalizedSlug;
    }

    user.gender =
      body.gender === undefined || body.gender === null ? null : body.gender;
    user.hometown = body.hometown?.trim() ? body.hometown.trim() : null;

    const savedUser = await this.userRepo.save(user);
    return this.buildProfileResponse(savedUser, true, savedUser);
  }

  async searchUsers(query?: string, authorizationHeader?: string) {
    const keyword = query?.trim();

    if (!keyword) {
      return [];
    }

    let currentUserId: string | null = null;

    try {
      const currentUser = await this.resolveUserFromAuthorization(authorizationHeader);
      currentUserId = currentUser.id;
    } catch {
      currentUserId = null;
    }

    const users = await this.userRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.slug',
        'user.username',
        'user.avatar_url',
        'user.bio',
      ])
      .where(currentUserId ? 'user.id <> :currentUserId' : '1=1', {
        currentUserId,
      })
      .orderBy('user.created_at', 'DESC')
      .limit(60)
      .getMany();

    const normalizedKeyword = normalizeSearchText(keyword);

    return users
      .map((user) => ({
        id: user.id,
        slug: user.slug,
        username: user.username,
        avatar_url: user.avatar_url ?? null,
        bio: user.bio ?? null,
        score: scoreSearchUser(user.username, user.slug, normalizedKeyword),
      }))
      .filter((user) => user.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 6)
      .map(({ score: _score, ...user }) => user);
  }

  private async resolveUserFromAuthorization(authorizationHeader?: string) {
    const token = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      email: string;
    }>(token);

    const user = await this.userRepo.findOne({
      where: { id: payload.sub as never },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async buildProfileResponse(
    user: User,
    includeEmail: boolean,
    currentUser?: User | null,
  ) {
    const [postCountResult, followerCountResult, followingCountResult] =
      await Promise.all([
        this.userRepo.query(
          `
            SELECT COUNT(*)::int AS count
            FROM posts
            WHERE user_id = $1
              AND post_type = 0
              AND deleted_at IS NULL
          `,
          [user.id],
        ),
        this.userRepo.query(
          `
            SELECT COUNT(*)::int AS count
            FROM follows
            WHERE following_id = $1
          `,
          [user.id],
        ),
        this.userRepo.query(
          `
            SELECT COUNT(*)::int AS count
            FROM follows
            WHERE follower_id = $1
          `,
          [user.id],
        ),
      ]);

    const friendship = currentUser
      ? await this.friendshipRepo.findOne({
          where: [
            { requester_id: currentUser.id, addressee_id: user.id },
            { requester_id: user.id, addressee_id: currentUser.id },
          ],
        })
      : null;

    const follow = currentUser
      ? await this.followRepo.findOne({
          where: {
            follower_id: currentUser.id,
            following_id: user.id,
          },
        })
      : null;

    return {
      id: user.id,
      slug: user.slug,
      username: user.username,
      ...(includeEmail ? { email: user.email } : {}),
      avatar_url: user.avatar_url ?? null,
      bio: user.bio ?? null,
      gender: user.gender ?? null,
      hometown: user.hometown ?? null,
      post_count: postCountResult[0]?.count ?? 0,
      follower_count: followerCountResult[0]?.count ?? 0,
      following_count: followingCountResult[0]?.count ?? 0,
      created_at: user.created_at,
      createAt: user.created_at,
      friendship_id: friendship?.id ?? null,
      friendship_status: resolveFriendshipStatus(currentUser, user, friendship),
      friendship_requested_by_me: Boolean(
        currentUser && friendship && friendship.requester_id === currentUser.id,
      ),
      is_following: currentUser ? Boolean(follow) : null,
    };
  }
}

function resolveFriendshipStatus(
  currentUser: User | null | undefined,
  targetUser: User,
  friendship: Friendship | null,
) {
  if (!currentUser) {
    return null;
  }

  if (currentUser.id === targetUser.id) {
    return 'self';
  }

  if (!friendship) {
    return 'none';
  }

  switch (friendship.status) {
    case 0:
      return 'pending';
    case 1:
      return 'accepted';
    case 2:
      return 'rejected';
    case 3:
      return 'blocked';
    default:
      return 'unknown';
  }
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSlug(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || null
  );
}

function scoreSearchUser(username: string, slug: string, normalizedKeyword: string) {
  const normalizedUsername = normalizeSearchText(username);
  const normalizedSlug = normalizeSearchText(slug);

  if (!normalizedKeyword || (!normalizedUsername && !normalizedSlug)) {
    return 0;
  }

  if (normalizedUsername === normalizedKeyword || normalizedSlug === normalizedKeyword) {
    return 100;
  }

  if (
    normalizedUsername.startsWith(normalizedKeyword) ||
    normalizedSlug.startsWith(normalizedKeyword)
  ) {
    return 90;
  }

  if (
    normalizedUsername.includes(normalizedKeyword) ||
    normalizedSlug.includes(normalizedKeyword)
  ) {
    return 75;
  }

  const keywordParts = normalizedKeyword.split(' ').filter(Boolean);
  const usernameParts = `${normalizedUsername} ${normalizedSlug}`
    .split(' ')
    .filter(Boolean);
  const matchedParts = keywordParts.filter((part) =>
    usernameParts.some((usernamePart) => usernamePart.includes(part)),
  ).length;

  if (matchedParts === keywordParts.length && matchedParts > 0) {
    return 60 + matchedParts;
  }

  if (matchedParts > 0) {
    return 30 + matchedParts;
  }

  return 0;
}
