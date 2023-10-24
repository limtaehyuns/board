import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsNumber()
  @IsNotEmpty()
  boardId: number;

  @IsBoolean()
  @IsNotEmpty()
  isNotice: boolean;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  imageSrc: string | null;
}
