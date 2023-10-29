import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardResolver } from './board.resolver';
import { Repository } from 'src/db/repository';

@Module({
  providers: [BoardResolver, BoardService, Repository],
})
export class BoardModule {}
