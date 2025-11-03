import { Controller, Post, Get, Patch, Body, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { Request, Response } from 'express';
import { REFRESH_TOKEN_COOKIE_NAME } from './constants';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);

    // Set refresh token as httpOnly cookie
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Don't send refresh token in response body
    const { refresh_token, ...response } = result;
    return response;
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);

    // Set refresh token as httpOnly cookie
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Don't send refresh token in response body
    const { refresh_token, ...response } = result;
    return response;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const result = await this.authService.refreshTokens(refreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Don't send refresh token in response body
    const { refresh_token, ...response } = result;
    return response;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear the cookie
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);

    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@GetUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @GetUser('id') userId: string,
    @Body() data: { name?: string; email?: string; phone?: string },
  ) {
    return this.authService.updateProfile(userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  updatePassword(
    @GetUser('id') userId: string,
    @Body() data: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.updatePassword(userId, data);
  }
}
