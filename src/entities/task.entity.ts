import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from './project.entity.js';
import { User } from './user.entity.js';
import { Comment } from './comment.entity.js';
import { TaskPriority, TaskStatus } from './enums.js';

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.Todo })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.Medium })
  priority: TaskPriority;

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(() => User, (user) => user.assignedTasks, { nullable: true })
  assignee: User | null;

  @ManyToOne(() => User, (user) => user.reportedTasks, { onDelete: 'SET NULL' })
  reporter: User;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
