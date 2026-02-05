import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { ProjectsModule } from 'src/projects-module/projects.module';
import { Project } from 'src/entities/project.entity';
import { Comment } from 'src/entities/comment.entity';

@Module({
  controllers: [TaskController],
  providers: [TaskService],
  imports: [TypeOrmModule.forFeature([Task, User,Project, Comment]), ProjectsModule]
})
export class TaskModule {}
