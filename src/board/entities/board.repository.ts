import { Injectable } from '@nestjs/common';
import { Board } from './board.entity';
import { Repository } from 'src/db/repository';
import { CreateBoardInput } from '../dto/create-board.input';
// import { CreateBoardDto } from '../dto/create-board.dto';
// import { Pagination, PaginationResult } from 'src/interface/Pagination';
// import { ResponseBoardDto } from '../dto/response-board.dto';
// import { Where } from 'src/interface/Query';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor() {
    super('board');
  }

  async insert(board: CreateBoardInput): Promise<Board> {
    const id = (await this.lastId()) + 1;
    await super.insert({ ...board, id });

    return await this.findOne({ id });
  }
}
