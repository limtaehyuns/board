import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { DbService } from 'src/db/db.service';
import { BoardService } from 'src/board/board.service';
import { RateService } from 'src/rate/rate.service';
import { CommentService } from 'src/comment/comment.service';

@Module({
  controllers: [PostController],
  providers: [
    PostService,
    DbService,
    BoardService,
    RateService,
    CommentService,
  ],
})
export class PostModule {}
