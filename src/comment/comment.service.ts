import { Injectable } from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { RateService } from 'src/rate/rate.service';
import { CommentRepository } from './entities/comment.repository';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly rateService: RateService,
  ) {}

  // private createCommentTree = (comments: any[]) => {
  //   const tree = [];
  //   const childrenOf = {};

  //   comments.forEach((comment) => {
  //     const { id, parentId } = comment;

  //     childrenOf[id] = childrenOf[id] || [];
  //     comment.children = childrenOf[id];

  //     if (parentId) {
  //       childrenOf[parentId] = childrenOf[parentId] || [];
  //       childrenOf[parentId].push(comment);
  //     } else {
  //       tree.push(comment);
  //     }
  //   });

  //   return tree;
  // };

  // async createRelations(data: Comment[]) {
  //   const processedArray: any[] = await Promise.all(
  //     data.map(async (comment: Comment) => {
  //       const rate = await this.rateService.getRate(null, comment.id);
  //       const author = { nickname: '임태현', id: 1 };
  //       return { ...comment, rate, author };
  //     }),
  //   );

  //   return processedArray;
  // }

  async create(data: CreateCommentDto) {
    return await this.commentRepository.insert(data);
  }

  async findAll(postId: number) {
    const comments = await this.commentRepository.where('comments', { postId });
    const processedComments = await this.createRelations(comments);
    return await this.createCommentTree(processedComments);
  }

  async update(commentId: number, content: string) {}

  async remove(commentId: number) {
    return await this.commentRepository.delete({ id: commentId });
  }
}
