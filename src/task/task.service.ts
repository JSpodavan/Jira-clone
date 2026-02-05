import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/entities/task.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Project } from 'src/entities/project.entity';
import { Comment } from 'src/entities/comment.entity';
import { updateTaskDto } from './dto/update-task.dto';
import { ProjectsService } from 'src/projects-module/projects.service';
import { createTaskDto } from './dto/create-tast.dto';
import { commentDto } from './dto/comment.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly projectsService: ProjectsService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>
  ) {}
  
  async getTask(taskId: string){
    return this.taskRepository.findOne({where: {id : taskId}});
  }

  async getProjectTasks(projectId: string){
    const project = await this.projectRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.taskRepository.find({
      where: { project: { id: projectId } },
      relations: ['assignee', 'reporter', 'project'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateTask(taskId: string, updateTaskDto: updateTaskDto){
    const task = await this.taskRepository.findOne({where: {id : taskId}});
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (updateTaskDto.description !== undefined){
        task.description = updateTaskDto.description;
    }
    if (updateTaskDto.status !== undefined){
        task.status = updateTaskDto.status;
    }
    if (updateTaskDto.priority !== undefined){
        task.priority = updateTaskDto.priority;
    }
    if (updateTaskDto.assigneeId !== undefined){
        if (updateTaskDto.assigneeId === null) {
          task.assignee = null;
        } else {
          const user = await this.usersRepository.findOne({where: {id: updateTaskDto.assigneeId}});
          if (!user) {
            throw new NotFoundException('User not found');
          }
          task.assignee = user;
        }
    }
    return this.taskRepository.save(task);
  }

  async createTask(projectId: string, userId: string, createTaskDto: createTaskDto){
    await this.projectsService.ensureManagerOrOwner(projectId, userId);

    const project = await this.projectRepository.findOne({where:{id: projectId}});
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const assigneeUser = await this.usersRepository.findOne({where: {id: createTaskDto.assigneeId}});
    if (!assigneeUser) {
      throw new NotFoundException('User not found');
    }

    const reporter = await this.usersRepository.findOne({where: {id: userId}});
    if (!reporter) {
      throw new NotFoundException('Reporter not found');
    }

    const task = this.taskRepository.create({
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status,
        priority: createTaskDto.priority,
        project: project,
        assignee: assigneeUser,
        reporter: reporter
    })

    return this.taskRepository.save(task)
  }

  async deleteTask(projectId: string, userId: string, taskId: string){
    await this.projectsService.ensureManagerOrOwner(projectId, userId);

    await this.taskRepository.delete(taskId);

    return {message: 'Задача удалена'}
  }

  async getComments(projectId: string, taskId: string, userId: string){
    await this.projectsService.ensureMember(projectId, userId);
    return this.commentRepository.find({
      where: { task: { id: taskId } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }
  async createComment(projectId: string, taskId: string, userId: string, createCommentDto: commentDto){
    await this.projectsService.ensureMember(projectId, userId);

    const task = await this.taskRepository.findOne({where: {id: taskId}});
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const author = await this.usersRepository.findOne({where: {id: userId}});
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const comment = this.commentRepository.create({
      body: createCommentDto.comment,
      task: task,
      author: author,
    });

    return this.commentRepository.save(comment);
  }

  async deleteComment(commentId: string, userId: string){
    const comment = await this.commentRepository.findOne({
      where: {id: commentId}, 
      relations: ['author', 'task', 'task.project']
    });
    if (!comment){
      throw new NotFoundException('Comment not found');
    }
    const isAuthor = comment.author.id === userId;
    
    if (!isAuthor){
      try {
        await this.projectsService.ensureManagerOrOwner(comment.task.project.id, userId);
      } catch {
        throw new ForbiddenException('Access denied');
      }
    }
    await this.commentRepository.delete(commentId);
    return {message: 'Comment deleted'};
  }
}
