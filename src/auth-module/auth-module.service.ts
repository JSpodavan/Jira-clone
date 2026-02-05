import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity.js';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthModuleService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { email, name, surname, password } = registerDto;
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        return { status: 'error', message: 'Email уже зарегистрирован' };
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = this.usersRepository.create({
        email,
        name,
        surname,
        passwordHash,
        refreshTokenHash: null,
      });
      await this.usersRepository.save(user);
      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      });
      return { status: 'ok', message: 'Регистрация успешна', accessToken };
    } catch (error) {
      return { status: 'error', message: 'Ошибка регистрации' };
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const user = await this.usersRepository.findOne({
        where: { email },
      });
      if (!user) {
        return { status: 'error', message: 'Неверный email или пароль' };
      }

      const passwordMatches = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatches) {
        return { status: 'error', message: 'Неверный email или пароль' };
      }

      const accessToken = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      });
      return { status: 'ok', message: 'Вход выполнен', accessToken };
    } catch (error) {
      return { status: 'error', message: 'Ошибка входа' };
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'surname'],
    });
    return user;
  }
}
