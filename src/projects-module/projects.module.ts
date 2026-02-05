import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from '../entities/project.entity.js';
import { ProjectMember } from '../entities/project-member.entity.js';
import { User } from '../entities/user.entity.js';
import { ProjectInvitation } from '../entities/invitation.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember, User, ProjectInvitation])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService]
})
export class ProjectsModule {}
