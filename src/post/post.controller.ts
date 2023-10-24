import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PostService, SearchType } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CommentService } from 'src/comment/comment.service';
import { RateService } from 'src/rate/rate.service';
import { RateLimit } from 'nestjs-rate-limiter';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly rateService: RateService,
    private readonly commentService: CommentService,
  ) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  findAll(@Query('limit') limit: number, @Query('offset') offset: number) {
    return this.postService.findAll(
      Number.isNaN(limit) ? 20 : limit,
      Number.isNaN(offset) ? 0 : offset,
    );
  }

  @Get('search')
  searchByKeyword(
    @Query('query') query: string,
    @Query('type') type: SearchType,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return this.postService.searchByQuery(
      Number.isNaN(limit) ? 20 : limit,
      Number.isNaN(offset) ? 0 : offset,
      type,
      query,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.postService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.postService.remove(+id);
  }

  @RateLimit({
    keyPrefix: 'rate-post',
    points: 1,
    duration: 0.5,
    errorMessage: '1초에 1번만 게시글을 평가할 수 있습니다.',
  })
  @Post(':id/rate')
  async rate(@Param('id') id: number, @Body('rate') rate: 0 | 1) {
    await this.postService.isPostExist(id);

    return this.rateService.create(rate, id);
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: number) {
    await this.postService.isPostExist(id);

    return this.commentService.findAll(id);
  }

  @Post(':id/comments')
  async createComment(
    @Param('id') id: number,
    @Body('content') content: string,
    @Body('parentId') parentId?: number,
  ) {
    await this.postService.isPostExist(id);

    return this.commentService.create(id, content, parentId);
  }

  @Patch(':id/comments/:commentId')
  async updateComment(
    @Param('id') id: number,
    @Param('commentId') commentId: number,
    @Body('content') content: string,
  ) {
    await this.postService.isPostExist(id);

    return this.commentService.update(commentId, content);
  }

  @Delete(':id/comments/:commentId')
  async removeComment(
    @Param('id') id: number,
    @Param('commentId') commentId: number,
  ) {
    await this.postService.isPostExist(id);

    return this.commentService.remove(commentId);
  }

  @RateLimit({
    keyPrefix: 'rate-comment',
    points: 1,
    duration: 1,
    errorMessage: '1초에 1번만 댓글을 평가할 수 있습니다.',
  })
  @Post(':id/comments/:commentId/rate')
  async rateComment(
    @Param('id') id: number,
    @Param('commentId') commentId: number,
    @Body('rate') rate: 0 | 1,
  ) {
    await this.postService.isPostExist(id);

    return this.rateService.create(null, commentId, rate);
  }
}
