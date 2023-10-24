import { Injectable } from '@nestjs/common';
import { Board } from './board.entity';
import { Repository } from 'src/db/repository';
import { CreateBoardDto } from '../dto/create-board.dto';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor() {
    super('board');
  }

  async insert(board: CreateBoardDto): Promise<Board> {
    const id = (await this.lastId()) + 1;
    await super.insert({ ...board, id });

    return await this.findOne({ id });
  }
  async findOne(
    where: Partial<Board>,
    children = true,
    pagenation: Pagenation,
  ): Promise<any>;
  async findOne(where: Partial<Board>, children = false): Promise<any> {
    const board = await super.findOne(where);
    if (children && board) {
      return {
        ...board,
        children: await super.where({ parentId: board.id }, {}),
      };
    }
    return board;
  }
}
