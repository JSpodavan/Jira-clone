import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.cookies?.access_token;
    
    if (!token) {
      throw new UnauthorizedException('Токен не найден');
    }
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Некорректный формат токена');
      }
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8')
      );
      return payload.sub;
    } catch (error) {
      throw new UnauthorizedException('Ошибка парсинга токена');
    }
  },
);