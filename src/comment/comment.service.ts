import { Injectable } from '@nestjs/common';
import { CommentRepository } from './entities/comment.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Pagination } from 'src/interface/Pagination';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

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

  async findAll(postId: number, pagination: Pagination) {
    return await this.commentRepository.commentFindAll(postId, pagination);
  }

  async update(commentId: number, content: string) {
    const comment = await this.commentRepository.findOne({ id: commentId });
    if (!comment) return null;

    this.commentRepository.update({ content, ...comment }, comment);
  }

  async remove(commentId: number) {
    return await this.commentRepository.delete({ id: commentId });
  }
}
