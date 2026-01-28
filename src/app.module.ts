import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthMiddleware } from './auth-module/jwt-auth.middleware';
import { Comment } from './entities/comment.entity.js';
import { ProjectMember } from './entities/project-member.entity.js';
import { Project } from './entities/project.entity.js';
import { Task } from './entities/task.entity.js';
import { ProjectInvitation } from './entities/invitation.entity.js';
import { User } from './entities/user.entity.js';
import { AuthModuleModule } from './auth-module/auth-module.module';
import { ProjectsModule } from './projects-module/projects.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Project, ProjectMember, Task, Comment, ProjectInvitation],
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModuleModule,
    ProjectsModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthMiddleware)
      .forRoutes(
        { path: 'index.html', method: RequestMethod.GET },
        { path: 'projects.html', method: RequestMethod.GET },
        { path: 'project.html', method: RequestMethod.GET },
      );
  }
}
