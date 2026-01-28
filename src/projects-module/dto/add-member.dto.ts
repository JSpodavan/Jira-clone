import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ProjectRole } from '../../entities/enums.js';

export class AddMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role: ProjectRole;
}
