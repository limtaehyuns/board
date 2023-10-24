import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { DbService } from 'src/db/db.service';
import { RateService } from 'src/rate/rate.service';

@Module({
  providers: [CommentService, DbService, RateService],
})
export class CommentModule {}
