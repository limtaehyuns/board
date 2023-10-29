import { Injectable } from '@nestjs/common';
import { CreateBoardInput } from './dto/create-board.input';
import { UpdateBoardInput } from './dto/update-board.input';
import { Repository } from 'src/db/repository';
import { Board } from './entities/board.entity';

class BoardRepository extends Repository<Board> {
  constructor() {
    super('board');
  }
}

@Injectable()
export class BoardService {
  private readonly boardRepository = new BoardRepository();
  constructor() {}
  create(createBoardInput: CreateBoardInput) {
    return 'This action adds a new board';
  }

  findAll() {
    return this.boardRepository.findAll();
  }

  findOne(id: number) {
    return `This action returns a #${id} board`;
  }

  findChildren(parentId: number) {
    if (!parentId) {
      return [];
    }
    return this.boardRepository.where({ parentId: { $eq: parentId } });
  }

  update(id: number, updateBoardInput: UpdateBoardInput) {
    return `This action updates a #${id} board`;
  }

  remove(id: number) {
    return `This action removes a #${id} board`;
  }
}
