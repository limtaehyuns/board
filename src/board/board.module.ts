import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { DbService } from 'src/db/db.service';

@Module({
  controllers: [BoardController],
  providers: [BoardService, DbService],
  exports: [BoardService],
})
export class BoardModule {}
