import { Injectable } from '@nestjs/common';
import { Repository } from 'src/db/repository';
import { Pagination, PaginationResult } from 'src/interface/Pagination';
import { Comment } from './comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { RateService } from 'src/rate/rate.service';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(private readonly rateSerivce: RateService) {
    super('comments');
  }

  async createRelations(data: Comment[]): Promise<Comment[]> {
    const processedArray: any[] = await Promise.all(
      data.map(async (comment: Comment) => {
        const rate = await this.rateSerivce.getRate(null, comment.id);
        const author = { nickname: '임태현', id: 1 };
        return { ...comment, rate, author };
      }),
    );

    return processedArray;
  }

  async insert(data: CreateCommentDto): Promise<Comment> {
    const id = (await super.lastId()) + 1;
    const createdAt = new Date();

    return await super.insert({ id, createdAt, ...data });
  }

  async commentFindAll(
    postId: number,
    pagination: Pagination,
  ): Promise<PaginationResult<Comment>> {
    const data = super.pagination(await super.where({ postId }), pagination);
    const processedComments = await this.createRelations(data.data);

    return { ...data, data: processedComments };
  }
}
