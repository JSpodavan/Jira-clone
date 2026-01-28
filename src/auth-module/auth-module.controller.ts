import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthModuleService } from './auth-module.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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
}
