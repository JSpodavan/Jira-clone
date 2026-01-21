import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task.entity.js';
import { User } from './user.entity.js';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  body: string;

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: 'CASCADE' })
  task: Task;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'SET NULL' })
  author: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
