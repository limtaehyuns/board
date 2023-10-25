import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: '게시글 ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  postId: number;

  @ApiProperty({
    description: '유저 ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: '내용',
    example: '내용',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: '부모 댓글 ID',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
