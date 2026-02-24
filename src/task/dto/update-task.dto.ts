import { IsArray, IsDateString, IsOptional, IsUUID, MaxLength, IsString } from "class-validator";
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

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsArray()
    @IsUUID("4", { each: true })
    parentTaskIds?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}