import { Controller, Get, Param, Req, Post, Body, Patch, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from 'src/auth-module/decorators/current-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';


@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}


  @Get()
  async findAllProjects(@CurrentUser() userId: string){
    return this.projectsService.findAll(userId)
  }

  @Get('my-managed')
  async findMyManagedProjects(@CurrentUser() userId: string){
    return this.projectsService.findMyManagedProjects(userId)
  }

  @Get('public/list')
  async findAllPublicProjects(@CurrentUser() userId: string){
    return this.projectsService.findAllPublic(userId)
  }

  @Get(':id')
  async findById(@Param('id') projectId: string, @CurrentUser() userId: string){
    const project = await this.projectsService.findOne(projectId, userId)

    return project
  }

  @Post()
  async createProject(@Body() dto: CreateProjectDto, @CurrentUser() userId: string){
    const createdProject = await this.projectsService.create(userId, dto)
    return createdProject
  }

  @Patch(':id')
  async updateProject(@Param('id') projectId: string, @Body() dto: UpdateProjectDto, @CurrentUser() userId:string){
    return this.projectsService.update(projectId, dto, userId)
  }
  @Delete(':id')
  async deleteProject(@Param('id') projectId: string, @CurrentUser() userId: string){
    return this.projectsService.remove(projectId, userId)
  }
  @Get(':id/members')
  async getProjectMembers(@Param('id') projectId: string, @CurrentUser() userId: string){
    return this.projectsService.getMembers(projectId, userId)
  }
  @Post(':id/members')
  async addNewMember(@Param('id') projectId: string, @Body() dto: AddMemberDto, @CurrentUser() userId: string){
    return this.projectsService.addMember(projectId, dto, userId)
  }
  @Delete(':id/members/:memberId')
  async deleteMember(@Param('id') projectId: string, @Param('memberId') memberId: string, @CurrentUser() userId: string){
    return this.projectsService.removeMember(projectId, memberId, userId)
  }

  @Patch(':id/members/:memberId/role')
  async changeMemberRole(@Param('id') projectId: string, @Param('memberId') memberId: string, @Body() dto: { role: string }, @CurrentUser() userId: string){
    return this.projectsService.changeMemberRole(projectId, memberId, dto.role, userId)
  }

  @Post(':projectId/join')
  async sendJoinInv(@Param('projectId') projectId: string, @CurrentUser() userId: string){
    return this.projectsService.sendJoinInv(projectId, userId)
  }
  @Get(':projectId/Invitation')
  async getAllInv(@Param('projectId') projectId:string, @CurrentUser() userId: string){
    return this.projectsService.getAllInv(projectId, userId)
  }

  @Post(':projectId/Invitation/:invitationId/accept')
  async acceptInv(@Param('projectId') projectId: string, @Param('invitationId') invitationId: string, @CurrentUser() userId: string){
    return this.projectsService.acceptInv(projectId, invitationId, userId)
  }
  @Post(':projectId/Invitation/:invitationId/reject')
  async rejectInv(@Param('projectId') projectId: string, @Param('invitationId') invitationId: string, @CurrentUser() userId: string){
    return this.projectsService.rejectInv(projectId, invitationId, userId)
  }
}
