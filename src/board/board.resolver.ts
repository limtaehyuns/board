import {
  ResolveField,
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Parent,
  ObjectType,
} from '@nestjs/graphql';
import { BoardService } from './board.service';
import { Board } from './entities/board.entity';
import { BoardDto } from './dto/board.dto';
import { Paginated } from 'src/common/pagination';
// import { CreateBoardInput } from './dto/create-board.input';
// import { UpdateBoardInput } from './dto/update-board.input';

// @ObjectType()
// class PaginatedBoard extends Paginated(BoardDto) {
//   hasNextPage = true;
//   // edges: IEdgeType<BoardDto>[];
//   nodes: BoardDto[];
//   totalCount = 10;
// }

@Resolver(() => BoardDto)
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @ResolveField(() => [BoardDto], { name: 'boards' })
  boards(@Parent() board: Board) {
    return this.boardService.findChildren(board.id);
  }

  @Query(() => [BoardDto], { name: 'board' })
  findAll() {
    return this.boardService.findAll();
  }

  // @ResolveField('boards')
  // async board(@Parent() board: BoardDto) {
  //   return this.boardService.findAll();ㅌ
  // }

  // @ResolveField('boards', () => [BoardDto])
  // async boards(@Parent() board: BoardDto) {
  //   return this.boardService.findAll();
  // }
}
