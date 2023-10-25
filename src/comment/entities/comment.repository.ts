import { Injectable } from '@nestjs/common';
import { Repository } from 'src/db/repository';
import { Pagination, PaginationResult } from 'src/interface/Pagination';
import { Where } from 'src/interface/Query';
import { Comment } from './comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor() {
    super('comments');
  }

  async insert(data: CreateCommentDto): Promise<Comment> {
    const id = (await super.lastId()) + 1;
    const createdAt = new Date();

    return await super.insert({ id, createdAt, ...data });
  }

  async findAll(
    postId: number,
    pagination: Pagination,
  ): Promise<PaginationResult<Comment>> {
    const data = super.pagination(await super.where({ postId }), pagination);

    if (!data) {
      return null;
    }
  }
}
