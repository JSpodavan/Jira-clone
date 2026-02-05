import { IsNotEmpty, MaxLength,  } from "class-validator";
export class commentDto{
    @IsNotEmpty()
    @MaxLength(200)
    comment: string
}