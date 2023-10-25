import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Board } from './entities/board.entity';
import { FindOneBoardDto } from './dto/findone-board';

@Controller('boards')
@ApiTags('게시판')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  @ApiOperation({ summary: '게시판 생성' })
  @ApiCreatedResponse({ description: '게시판 생성 결과', type: Board })
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardService.create(createBoardDto);
  }

  @Get()
  @ApiOperation({ summary: '게시판 목록 조회' })
  @ApiCreatedResponse({ description: '게시판 목록 조회 결과', type: [Board] })
  findAll(@Param('page') page: number, @Param('limit') limit: number) {
    return this.boardService.findAll({ page, limit });
  }

  @Get(':id')
  findOne(@Param() param: FindOneBoardDto) {
    return this.boardService.findOne(param);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardService.update(id, updateBoardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.boardService.remove(id);
  }
}
