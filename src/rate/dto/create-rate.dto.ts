import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export enum RateType {
  LIKE = 1,
  DISLIKE = 0,
}

export class CreateRateDto {
  @IsOptional()
  @IsNumber()
  postId?: number;

  @IsOptional()
  @IsNumber()
  commentId?: number;

  @IsNotEmpty()
  @IsEnum(RateType)
  rate: RateType;
}
