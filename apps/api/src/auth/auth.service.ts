import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto';
import { JWT_ACCESS_TOKEN_EXPIRATION, JWT_REFRESH_TOKEN_EXPIRATION } from './constants';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        password: hashedPassword,
        role: 'CLIENT',
        locale: dto.locale || 'en',
      },
    });

    return this.generateTokens(user.id, user.email, user.role, user.name, user.phone);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return this.generateTokens(user.id, user.email, user.role, user.name, user.phone);
  }

  async refreshTokens(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!tokenRecord.user.active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    return this.generateTokens(tokenRecord.user.id, tokenRecord.user.email, tokenRecord.user.role, tokenRecord.user.name, tokenRecord.user.phone);
  }

  async logout(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (tokenRecord) {
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });
    }

    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        locale: true,
        active: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; email?: string; phone?: string }) {
    // Check if email is being changed and if it's already taken
    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        locale: true,
        active: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updatePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string, name: string, phone: string | null) {
    const payload = { sub: userId, email, role };

    // Generate access token (15 minutes)
    const accessToken = this.jwt.sign(payload, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRATION,
    });

    // Generate refresh token (7 days)
    const refreshToken = randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: userId, email, role, name, phone },
    };
  }
}
