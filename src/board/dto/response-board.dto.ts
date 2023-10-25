import { PaginationResult } from 'src/interface/Pagination';
import { Board } from '../entities/board.entity';

export interface ResponseBoardDto extends Board {
  children?: PaginationResult<Board>;
}
