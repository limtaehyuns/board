import { Injectable } from '@nestjs/common';
import { Board } from './board.entity';
import { Repository } from 'src/db/repository';
import { CreateBoardDto } from '../dto/create-board.dto';
import { Pagination, PaginationResult } from 'src/interface/Pagination';
import { ResponseBoardDto } from '../dto/response-board.dto';
import { Where } from 'src/interface/Query';

export interface ChildrenType {
  load: boolean;
  pagination?: Pagination;
}

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor() {
    super('board');
  }

  async insert(board: CreateBoardDto): Promise<Board> {
    const id = (await this.lastId()) + 1;
    await super.insert({ ...board, id });

    return await this.findOne({ id }, { load: false });
  }

  async findOne(
    where: Where<Board>,
    children?: ChildrenType,
  ): Promise<ResponseBoardDto> {
    const board = await super.findOne(where);
    if (children && board && children.load) {
      const childrenResult = await super.pagination(
        await this.where({ parentId: board.id }),
        children.pagination,
      );
      return {
        ...board,
        children: childrenResult,
      };
    }
    return board;
  }

  async findAll(pagination: Pagination): Promise<PaginationResult<Board>> {
    const boards = await super.findAll(pagination);
    return boards;
  }
}
