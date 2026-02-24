import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity.js';
import { ProjectMember } from '../entities/project-member.entity.js';
import { User } from '../entities/user.entity.js';
import { ProjectRole } from '../entities/enums.js';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ProjectInvitation } from '../entities/invitation.entity.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly membersRepository: Repository<ProjectMember>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ProjectInvitation)
    private readonly invitationRepository: Repository<ProjectInvitation>
  ) {}

  async getMemberRole(projectId: string, userId: string) {
    const member = await this.membersRepository.findOne({
      where: { project: { id: projectId }, user: { id: userId } },
    });
    return member?.role ?? null;
  }

  private async ensureProjectExists(projectId: string) {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }
    return project;
  }

  private async ensureOwner(projectId: string, userId: string) {
    const role = await this.getMemberRole(projectId, userId);
    if (role !== ProjectRole.Owner) {
      throw new ForbiddenException('Доступ запрещен');
    }
  }

  async ensureManagerOrOwner(projectId: string, userId: string) {
    const role = await this.getMemberRole(projectId, userId);
    if (role === null) {
      throw new ForbiddenException('Доступ запрещен');
    }
    if (![ProjectRole.Owner, ProjectRole.Manager].includes(role)) {
      throw new ForbiddenException('Доступ запрещен');
    }
  }
  async ensureMember(projectId: string, userId: string) {
    const role = await this.getMemberRole(projectId, userId);
    if (role === null) {
      throw new ForbiddenException('Доступ запрещен');
    }
  }

  async create(userId: string, createProjectDto: CreateProjectDto) {
    const owner = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!owner) {
      throw new NotFoundException('Пользователь не найден');
    }

    const project = this.projectsRepository.create({
      name: createProjectDto.name,
      description: createProjectDto.description ?? null,
      owner,
    });
    await this.projectsRepository.save(project);

    const member = this.membersRepository.create({
      project,
      user: owner,
      role: ProjectRole.Owner,
    });
    await this.membersRepository.save(member);

    return project;
  }

  async findAll(userId: string) {
    return this.projectsRepository
      .createQueryBuilder('project')
      .innerJoin('project.members', 'member')
      .where('member.userId = :userId', { userId })
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.members', 'members')
      .getMany();
  }

  async findAllPublic(userId: string) {
    const userProjects = await this.projectsRepository
      .createQueryBuilder('project')
      .innerJoin('project.members', 'member')
      .where('member.userId = :userId', { userId })
      .select('project.id')
      .getMany();
    
    const userProjectIds = userProjects.map(p => p.id);
    
    const query = this.projectsRepository
      .createQueryBuilder('project')
      .select(['project.id', 'project.name', 'project.description']);
    
    if (userProjectIds.length > 0) {
      query.where('project.id NOT IN (:...ids)', { ids: userProjectIds });
    }
    
    return query.getMany();
  }

  async findOne(projectId: string, userId: string) {
    await this.ensureMember(projectId, userId);
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['members', 'members.user', 'tasks'],
    });
    if (!project) {
      throw new NotFoundException('Проект не найден');
    }
    const role = await this.getMemberRole(projectId, userId);
    return { ...project, currentUserRole: role };
  }

  async update(
    projectId: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ) {
    await this.ensureOwner(projectId, userId);
    const project = await this.ensureProjectExists(projectId);

    if (updateProjectDto.name !== undefined) {
      project.name = updateProjectDto.name;
    }
    if (updateProjectDto.description !== undefined) {
      project.description = updateProjectDto.description ?? null;
    }

    return this.projectsRepository.save(project);
  }

  async remove(projectId: string, userId: string) {
    await this.ensureOwner(projectId, userId);
    await this.projectsRepository.delete(projectId);
    return { message: 'Проект удален' };
  }

  async addMember(
    projectId: string,
    addMemberDto: AddMemberDto,
    userId: string,
  ) {
    await this.ensureManagerOrOwner(projectId, userId);
    const project = await this.ensureProjectExists(projectId);
    const user = await this.usersRepository.findOne({
      where: { id: addMemberDto.userId },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const existing = await this.membersRepository.findOne({
      where: { project: { id: projectId }, user: { id: user.id } },
    });
    if (existing) {
      throw new ConflictException('Пользователь уже добавлен в проект');
    }

    const member = this.membersRepository.create({
      project,
      user,
      role: addMemberDto.role,
    });
    return this.membersRepository.save(member);
  }

  async removeMember(projectId: string, memberId: string, userId: string) {
    await this.ensureManagerOrOwner(projectId, userId);
    const member = await this.membersRepository.findOne({
      where: { id: memberId, project: { id: projectId } },
    });
    if (!member) {
      throw new NotFoundException('Участник не найден');
    }
    await this.membersRepository.remove(member);
    return { message: 'Участник удален' };
  }

  async changeMemberRole(projectId: string, memberId: string, newRole: string, userId: string) {
    const currentUserRole = await this.getMemberRole(projectId, userId);
    
    if (currentUserRole === ProjectRole.Manager && newRole !== ProjectRole.Member) {
      throw new ForbiddenException('Manager can only change role to MEMBER');
    }
    
    if (currentUserRole !== ProjectRole.Owner && currentUserRole !== ProjectRole.Manager) {
      throw new ForbiddenException('Access denied');
    }

    const member = await this.membersRepository.findOne({
      where: { id: memberId, project: { id: projectId } },
      relations: ['user'],
    });
    
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    member.role = newRole as ProjectRole;
    await this.membersRepository.save(member);
    return { message: 'Role updated' };
  }

  async getMembers(projectId: string, userId: string) {
    await this.ensureProjectExists(projectId);
    await this.ensureMember(projectId, userId)
    return this.membersRepository.find({
      where: { project: { id: projectId } },
      relations: ['user'],
    });
  }
  async sendJoinInv(projectId: string, userId: string){
    const project = await this.projectsRepository.findOne({
      where: { id: projectId }
    });
    if (!project) throw new NotFoundException('Проект не найден');

    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });
    if (!user) throw new NotFoundException('Пользователь не найден');
  
    const existing = await this.membersRepository.findOne({
      where: { 
        project: { id: projectId }, 
        user: { id: userId } 
      }
    });
    if (existing) throw new ConflictException('Пользователь уже находится в проекте');
  
    const invitation = this.invitationRepository.create({
      project,
      user,
      status: 'PENDING' 
    });
  
    return this.invitationRepository.save(invitation);
  }

  async getAllInv(projectId: string, userId: string){
    await this.ensureManagerOrOwner(projectId, userId);
  
    return this.invitationRepository
      .createQueryBuilder('invitation')
      .leftJoinAndSelect('invitation.user', 'user')
      .leftJoin('invitation.project', 'project')
      .where('project.id = :projectId', { projectId })
      .andWhere('invitation.status = :status', { status: 'PENDING' })
      .getMany();
  }

  async acceptInv(projectId: string, invitationId: string, userId: string){
    await this.ensureManagerOrOwner(projectId, userId);


    const accepted = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['project', 'user'],
    });

    if (!accepted) throw new NotFoundException('Заявка не найдена');
    if (!accepted.project || accepted.project.id !== projectId) {
      throw new NotFoundException('Заявка не найдена');
    }

    accepted.status = 'ACCEPTED';

    await this.invitationRepository.save(accepted)

    const member = this.membersRepository.create({
      project: accepted.project,
      user: accepted.user,
      role: ProjectRole.Member,
    });
    await this.membersRepository.save(member);
    
    return { message: 'Заявка принята' };
  }

  async rejectInv(projectId: string, invitationId: string, userId: string){
    await this.ensureManagerOrOwner(projectId, userId);

    const reject = await this.invitationRepository.findOne({
      where: { id: invitationId },
      relations: ['project'],
    })

    if (!reject) throw new NotFoundException('Заявка не найдена');
    if (!reject.project || reject.project.id !== projectId) {
      throw new NotFoundException('Заявка не найдена');
    }

    reject.status = 'REJECTED'

    await this.invitationRepository.save(reject)

    return { message: 'Заявка отклонена' };
  }

  async findMyManagedProjects(userId: string) {
    const memberships = await this.membersRepository.find({
      where: { user: { id: userId } },
      relations: ['project', 'project.owner'],
    });
    
    const managedProjects = memberships
      .filter(m => m.role === ProjectRole.Owner || m.role === ProjectRole.Manager)
      .map(m => m.project);
    
    return managedProjects;
  }

}
