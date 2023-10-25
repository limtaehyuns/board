import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { DbService } from 'src/db/db.service';
import { BoardService } from 'src/board/board.service';
import { RateService } from 'src/rate/rate.service';
import { CommentService } from 'src/comment/comment.service';
import { BoardRepository } from 'src/board/entities/board.repository';
import { RateModule } from 'src/rate/rate.module';
import { CommentModule } from 'src/comment/comment.module';
import { PostRepository } from './entities/post.repository';

@Module({
  imports: [RateModule, CommentModule],
  controllers: [PostController],
  providers: [
    PostService,
    DbService,
    BoardService,
    BoardRepository,
    RateService,
    PostRepository,
    CommentService,
  ],
})
export class PostModule {}
