import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { Comment } from './entities/comment.entity';
import { RateService } from 'src/rate/rate.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: DbService<Comment>,
    private readonly rateService: RateService,
  ) {}

  private createCommentTree = (comments: any[]) => {
    const tree = [];
    const childrenOf = {};

    comments.forEach((comment) => {
      const { id, parentId } = comment;

      childrenOf[id] = childrenOf[id] || [];
      comment.children = childrenOf[id];

      if (parentId) {
        childrenOf[parentId] = childrenOf[parentId] || [];
        childrenOf[parentId].push(comment);
      } else {
        tree.push(comment);
      }
    });

    return tree;
  };

  async createRelations(data: Comment[]) {
    const processedArray: any[] = await Promise.all(
      data.map(async (comment: Comment) => {
        const rate = await this.rateService.getRate(null, comment.id);
        const author = { nickname: '임태현', id: 1 };
        return { ...comment, rate, author };
      }),
    );

    return processedArray;
  }

  async create(postId: number, content: string, parentId?: number) {
    const userId = 1;
    const createdAt = new Date();
    const id = (await this.commentRepository.getLastId('comments')) + 1;

    const newComment: Comment = {
      id,
      userId,
      postId,
      content,
      createdAt,
      parentId,
    };

    return await this.commentRepository.create('comments', newComment);
  }

  async findAll(postId: number) {
    const comments = await this.commentRepository.where('comments', { postId });
    const processedComments = await this.createRelations(comments);
    return await this.createCommentTree(processedComments);
  }

  async update(commentId: number, content: string) {
    const [comment] = await this.commentRepository.where('comments', {
      id: commentId,
    });
    if (!comment) throw new Error('comment not found');

    comment.content = content;
    return await this.commentRepository.update(
      'comments',
      { id: commentId },
      comment,
    );
  }

  async remove(commentId: number) {
    return await this.commentRepository.delete('comments', { id: commentId });
  }
}
