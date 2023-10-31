import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { BoardService } from './board.service';
import { Board } from './entities/board.entity';
import { CreateBoardInput } from './dto/create-board.input';
import { UpdateBoardInput } from './dto/update-board.input';

@Resolver(() => Board)
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @ResolveField(() => [Board], { nullable: true })
  boards(@Parent() parent: Board) {
    const parentId = parent.id;

    return this.boardService.findChildrens(parentId);
  }

  @Mutation(() => Board)
  createBoard(@Args('createBoardInput') createBoardInput: CreateBoardInput) {
    console.log(createBoardInput);
    return this.boardService.create(createBoardInput);
  }
  @Query(() => Board, { name: 'board' })
  findOne(@Args('id', { type: () => Int, nullable: true }) id?: number) {
    console.log(typeof id);
    return id !== undefined
      ? this.boardService.findOne(id)
      : this.boardService.findAll();
  }

  @Mutation(() => Board)
  updateBoard(@Args('updateBoardInput') updateBoardInput: UpdateBoardInput) {
    return this.boardService.update(updateBoardInput.id, updateBoardInput);
  }

  @Mutation(() => Board)
  removeBoard(@Args('id', { type: () => Int }) id: number) {
    return this.boardService.remove(id);
  }
}
