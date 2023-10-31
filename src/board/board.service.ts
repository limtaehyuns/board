import { Injectable } from '@nestjs/common';
import { CreateBoardInput } from './dto/create-board.input';
import { UpdateBoardInput } from './dto/update-board.input';
import { BoardRepository } from './entities/board.repository';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async create(createBoardInput: CreateBoardInput) {
    return await this.boardRepository.insert(createBoardInput);
  }

  findAll() {
    return this.boardRepository.where({});
  }

  findOne(id: number) {
    return this.boardRepository.findOne({ id });
  }

  findChildrens(parentId: number) {
    return this.boardRepository.where({ parentId: { $eq: parentId } });
  }

  update(id: number, updateBoardInput: UpdateBoardInput) {
    return `This action updates a #${id} board`;
  }

  remove(id: number) {
    return this.boardRepository.delete({ id });
  }
}
