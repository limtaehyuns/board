import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { RateService } from 'src/rate/rate.service';
import { CommentRepository } from './entities/comment.repository';
import { RateModule } from 'src/rate/rate.module';

@Module({
  imports: [RateModule],
  providers: [CommentService, RateService, CommentRepository],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
