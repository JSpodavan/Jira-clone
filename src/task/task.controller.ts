import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { CurrentUser } from 'src/auth-module/decorators/current-user.decorator';
import { updateTaskDto } from './dto/update-task.dto';
import { createTaskDto } from './dto/create-tast.dto';
import { create } from 'domain';
import { commentDto } from './dto/comment.dto';

@Controller('/api/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}


  @Get(':taskId')
  async getTask(@Param('taskId') taskId: string){
    return this.taskService.getTask(taskId)
  }

  @Get('project/:projectId')
  async getProjectTasks(@Param('projectId') projectId: string){
    return this.taskService.getProjectTasks(projectId)
  }

  @Post(':taskId')
  async updateTask(@Param('taskId') taskId: string, @Body() updateTaskDto : updateTaskDto){
    return this.taskService.updateTask(taskId, updateTaskDto)
  }

  @Post(':projectId/createTask')
  async createTask(@Param('projectId') projectId: string, @CurrentUser() userId: string, @Body() createTaskDto: createTaskDto){
    return this.taskService.createTask(projectId, userId, createTaskDto);
  }
  @Delete(':projectId/:taskId')
  async deleteTask(@Param('projectId') projectId: string, @CurrentUser() userId: string, @Param('taskId') taskId: string){
    return this.taskService.deleteTask(projectId, userId, taskId)
  }
  @Get(':projectId/:taskId/:comments')
  async getComments(@Param('projectId') projectId: string, @Param('taskId') taskId: string, @CurrentUser() userId: string){
    return this.taskService.getComments(projectId, taskId, userId);
  }

  @Post(':projectId/:taskId/comment/createComment')
  async createComment(@Param('projectId') projectId: string, @Param('taskId') taskId: string, @CurrentUser() userId: string, @Body() createCommentDto: commentDto){
    return this.taskService.createComment(projectId, taskId, userId, createCommentDto);
  }

  @Delete('/comment/:commentId')
  async deleteComment(@Param('commentId') commentId: string, @CurrentUser() userId: string){
    return this.taskService.deleteComment(commentId, userId);
  }
}
