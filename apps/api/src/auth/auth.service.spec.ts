import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { User, RefreshToken } from '@prisma/client';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  email: 'eliana@example.com',
  phone: '0500000000',
  name: 'Eliana',
  password: 'hashed',
  role: 'CLIENT',
  locale: 'en',
  active: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

const makeRefreshToken = (overrides: Partial<RefreshToken> = {}): RefreshToken => ({
  id: 'rt-1',
  token: 'refresh-token',
  userId: 'user-1',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
  revokedAt: null,
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
    refreshToken: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      refreshToken: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('access-token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const dto = { email: 'new@example.com', password: 'Str0ngPass!', name: 'New Client' };

    it('rejects an email that is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ email: dto.email }));

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('stores the password hashed, never in clear text', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(({ data }: { data: User }) =>
        Promise.resolve(makeUser(data)),
      );
      prisma.refreshToken.create.mockResolvedValue(makeRefreshToken());

      await service.register(dto);

      const stored = prisma.user.create.mock.calls[0][0].data.password;
      expect(stored).not.toBe(dto.password);
      await expect(bcrypt.compare(dto.password, stored)).resolves.toBe(true);
    });

    it('returns both tokens and persists the refresh token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(makeUser({ email: dto.email }));
      prisma.refreshToken.create.mockResolvedValue(makeRefreshToken());

      const result = await service.register(dto);

      expect(result.access_token).toBe('access-token');
      expect(result.refresh_token).toEqual(expect.any(String));
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'ghost@example.com', password: 'x' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a wrong password', async () => {
      const password = await bcrypt.hash('correct-password', 10);
      prisma.user.findUnique.mockResolvedValue(makeUser({ password }));

      await expect(
        service.login({ email: 'eliana@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a deactivated account even with the right password', async () => {
      const password = await bcrypt.hash('correct-password', 10);
      prisma.user.findUnique.mockResolvedValue(makeUser({ password, active: false }));

      await expect(
        service.login({ email: 'eliana@example.com', password: 'correct-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('issues tokens on valid credentials', async () => {
      const password = await bcrypt.hash('correct-password', 10);
      prisma.user.findUnique.mockResolvedValue(makeUser({ password }));
      prisma.refreshToken.create.mockResolvedValue(makeRefreshToken());

      const result = await service.login({
        email: 'eliana@example.com',
        password: 'correct-password',
      });

      expect(result.access_token).toBe('access-token');
      expect(result.user).toMatchObject({ id: 'user-1', role: 'CLIENT' });
    });
  });

  describe('refreshTokens', () => {
    it('rejects an unknown token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('nope')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a revoked token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...makeRefreshToken({ revokedAt: new Date() }),
        user: makeUser(),
      });

      await expect(service.refreshTokens('refresh-token')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an expired token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...makeRefreshToken({ expiresAt: new Date(Date.now() - 1000) }),
        user: makeUser(),
      });

      await expect(service.refreshTokens('refresh-token')).rejects.toThrow(UnauthorizedException);
    });

    it('revokes the old token before issuing a new pair', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...makeRefreshToken(),
        user: makeUser(),
      });
      prisma.refreshToken.update.mockResolvedValue(makeRefreshToken());
      prisma.refreshToken.create.mockResolvedValue(makeRefreshToken());

      const result = await service.refreshTokens('refresh-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'rt-1' },
        data: { revokedAt: expect.any(Date) },
      });
      expect(result.refresh_token).not.toBe('refresh-token');
    });
  });

  describe('updatePassword', () => {
    it('refuses to change the password when the current one is wrong', async () => {
      const password = await bcrypt.hash('correct-password', 10);
      prisma.user.findUnique.mockResolvedValue(makeUser({ password }));

      await expect(
        service.updatePassword('user-1', {
          currentPassword: 'wrong-password',
          newPassword: 'N3wPass!',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('writes a hash of the new password', async () => {
      const password = await bcrypt.hash('correct-password', 10);
      prisma.user.findUnique.mockResolvedValue(makeUser({ password }));
      prisma.user.update.mockResolvedValue(makeUser());

      await service.updatePassword('user-1', {
        currentPassword: 'correct-password',
        newPassword: 'N3wPass!',
      });

      const written = prisma.user.update.mock.calls[0][0].data.password;
      expect(written).not.toBe('N3wPass!');
      await expect(bcrypt.compare('N3wPass!', written)).resolves.toBe(true);
    });
  });
});
