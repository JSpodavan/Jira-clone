import { IsOptional, IsUUID, MaxLength } from "class-validator";
import { TaskPriority, TaskStatus } from "src/entities/enums";



export class updateTaskDto{
    @MaxLength(100)
    description?: string;

    @IsOptional()
    status?: TaskStatus;
    @IsOptional()
    priority?: TaskPriority;

    @IsOptional()
    @IsUUID()
    assigneeId?: string;   
}