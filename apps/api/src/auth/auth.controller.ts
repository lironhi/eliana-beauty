import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, GoogleLoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { Request, Response } from 'express';
import { REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_MAX_AGE_MS } from './constants';

// The front end is served from a different site than the API in production
// (Vercel vs Render), and a SameSite=Strict cookie is never sent on those
// cross-site requests -- /auth/refresh would silently stop working. Cross-site
// cookies require SameSite=None, which browsers only accept together with
// Secure. Locally the front and API are both on localhost, so Strict is fine
// and Secure must stay off because dev runs over plain http.
const isProduction = process.env.NODE_ENV === 'production';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('strict' as const),
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);

    // Set refresh token as httpOnly cookie
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refresh_token, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
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
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });

    // Don't send refresh token in response body
    const { refresh_token, ...response } = result;
    return response;
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async google(@Body() dto: GoogleLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.loginWithGoogle(dto.credential);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refresh_token, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });

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
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
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
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);

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
