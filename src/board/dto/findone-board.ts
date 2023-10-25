import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class FindOneBoardDto {
  @ApiProperty({
    name: 'id',
    description: '게시판 번호',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({
    name: 'children',
    description: '자식 게시판 목록 조회 여부',
    required: false,
    default: false,
  })
  @IsBoolean()
  children: boolean;

  @ApiProperty({
    name: 'page',
    description: '페이지 번호',
    required: false,
    default: 1,
  })
  @IsNumber()
  @IsOptional({ groups: ['children'] })
  page: number;

  @ApiProperty({
    name: 'limit',
    description: '한 페이지에 보여줄 게시글 수',
    required: false,
    default: 10,
  })
  @IsNumber()
  @IsOptional({ groups: ['children'] })
  limit: number;
}
