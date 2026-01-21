import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity.js';
import { Project } from './project.entity.js';
import { ProjectRole } from './enums.js';

@Entity({ name: 'project_members' })
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE',
  })
  project: Project;

  @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: ProjectRole, default: ProjectRole.Member })
  role: ProjectRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
