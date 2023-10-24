import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsBoolean()
  @IsNotEmpty()
  isShortcut: boolean;

  @IsBoolean()
  @IsNotEmpty()
  bookmarkable: boolean;

  @IsNumber()
  @IsOptional()
  parentId?: number;
}
