import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardResolver } from './board.resolver';
import { DbService } from 'src/db/db.service';
import { DbModule } from 'src/db/db.module';
import { BoardRepository } from './entities/board.repository';

@Module({
  imports: [DbModule],
  providers: [BoardResolver, BoardService, DbService, BoardRepository],
})
export class BoardModule {}
