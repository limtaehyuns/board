import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardRepository } from './entities/board.repository';

@Injectable()
export class BoardService {
  constructor(private readonly boardRepository: BoardRepository) {}

  async create(createBoardDto: CreateBoardDto) {
    const insertResult = await this.boardRepository.insert(createBoardDto);

    return insertResult;
  }

  private createChildrenTree(boards: any[]) {
    const itemMap = new Map();
    const root = [];

    for (const item of boards) {
      item.children = [];
      itemMap.set(item.id, item);
    }

    for (const item of boards) {
      if (item.parentId !== item.id) {
        const parentItem = itemMap.get(item.parentId);
        if (parentItem) {
          parentItem.children.push(item);
        } else {
          root.push(item);
        }
      } else {
        root.push(item);
      }
    }

    return root;
  }

  async findAll() {
    const boards = await this.boardRepository.findAll();
    return this.createChildrenTree(boards);
  }

  async findOne(id: number) {
    const [board] = await this.boardRepository.where({ id });
    if (!board) throw new NotFoundException('resource not found');

    return board;
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    let [board] = await this.boardRepository.where({ id });
    board = { ...board, ...updateBoardDto };

    return await this.boardRepository.update(board, { id });
  }

  async remove(id: number) {
    await this.boardRepository.delete({ id });
  }
}
