import { Body, Controller, Post, Res, Get } from '@nestjs/common';
import type { Response } from 'express';
import { AuthModuleService } from './auth-module.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthModuleController {
  constructor(private readonly authModuleService: AuthModuleService) {}

  @Post('reg')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authModuleService.register(registerDto);
    if (result.status === 'ok' && result.accessToken) {
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
    return { status: result.status, message: result.message };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authModuleService.login(loginDto);
    if (result.status === 'ok' && result.accessToken) {
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
    return { status: result.status, message: result.message };
  }

  @Get('me')
  async getCurrentUser(@CurrentUser() userId: string) {
    return this.authModuleService.getCurrentUser(userId);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { status: 'ok', message: 'Logged out' };
  }
}
