import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.access_token;
    if (!token) {
      res.redirect('/reg.html');
      return;
    }

    try {
      await this.jwtService.verifyAsync(token);
      next();
    } catch (error) {
      res.redirect('/reg.html');
    }
  }
}
