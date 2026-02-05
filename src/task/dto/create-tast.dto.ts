import { IsNotEmpty, IsOptional, IsUUID, isUUID, Length, MaxLength } from "class-validator";
import { TaskPriority, TaskStatus } from "src/entities/enums";



export class createTaskDto{

    @IsUUID()
    assigneeId: string

    @IsNotEmpty()
    @Length(2, 30)
    title: string;

    @IsOptional()
    @MaxLength(100)
    description?: string;

    @IsNotEmpty()
    status: TaskStatus;

    @IsOptional()
    priority?: TaskPriority;  
}