import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { BoardService } from 'src/board/board.service';
import { PostRepository } from './entities/post.repository';
import { Pagination } from 'src/interface/Pagination';

export enum SearchType {
  TITLE = 0,
  CONTENT = 1,
  TITLE_AND_CONTENT = 2,
  NICKNAME = 3,
  COMMENT = 4,
}

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly boardService: BoardService,
  ) {}

  // private async createRelations(data: Post[], comments = false) {
  //   const processedArray: GetPostDto[] = await Promise.all(
  //     data.map(async (post: Post) => {
  //       const rate = await this.rateService.getRate(post.id);
  //       const author = { nickname: '임태현', id: 1 };
  //       if (comments) {
  //         const comments = await this.commentService.findAll(post.id);
  //         return { ...post, rate, author, comments };
  //       }
  //       return { ...post, rate, author };
  //     }),
  //   );

  //   return processedArray;
  // }

  // private async getPosts(
  //   data: Post[],
  //   limit: number,
  //   offset: number,
  //   filter?: (post: GetPostDto) => unknown,
  // ) {
  //   const normalPosts: Post[] = data
  //     .filter((post) => !post.isNotice)
  //     .sort((a, b) => b.id - a.id); // is Notice = false and sort by id desc
  //   const noticePosts: Post[] = data
  //     .filter((post) => post.isNotice)
  //     .sort((a, b) => b.id - a.id); // is Notice = true and sort by id desc

  //   if (filter) {
  //     normalPosts.filter(filter);
  //   }

  //   const postData: {
  //     notices: GetPostDto[];
  //     normal: GetPostDto[];
  //     pagenation: { pages: number; current: number };
  //   } = {
  //     pagenation: {
  //       pages: Math.ceil(normalPosts.length / limit),
  //       current: Math.ceil((offset * limit) / limit) + 1,
  //     },
  //     notices: await this.createRelations(noticePosts),
  //     normal: (await this.createRelations(normalPosts)).slice(
  //       offset * limit,
  //       limit + offset * limit,
  //     ),
  //   };

  //   return postData;
  // }

  async isPostExist(id: number) {
    const post = await this.postRepository.findOne({ id });
    if (!post) throw new NotFoundException('resource not found');

    return true;
  }

  async create(createPostDto: CreatePostDto) {
    const id = (await this.postRepository.lastId()) + 1;
    const userId = 1;
    const createdAt = new Date();

    const board = await this.boardService.findOne({
      id: createPostDto.boardId,
      children: false,
      limit: 1,
      page: 0,
    });
    if (!board) throw new NotFoundException('board resource not found');

    const newPost: Post = {
      id,
      userId,
      createdAt,
      viewCount: 0,
      ...createPostDto,
    };
    return await this.postRepository.insert(newPost);
  }

  async findAll(pagination: Pagination) {
    const db = await this.postRepository.where(pagination);

    // const postData = await this.getPosts(db, limit, offset);
    return db;
  }

  async searchBySlug(slug: string, pagination: Pagination) {
    const slugs = await this.postRepository.searchSlug(slug); // get target slug

    const db = await this.postRepository.where({
      boardId: {
        $in: slugs,
      },
    }); // get all posts from slug
    return this.postRepository.pagination(db, pagination);
  }

  async searchByQuery(
    pagination: Pagination,
    type: SearchType,
    query?: string,
    slug?: string,
  ) {
    const targetSlugs = slug ? this.postRepository.searchSlug(slug) : [];

    return this.postRepository.pagination(
      await this.postRepository.where({
        boardId: {
          $in: targetSlugs,
        },
        content:
          type === SearchType.TITLE_AND_CONTENT || SearchType.CONTENT
            ? query
            : undefined,
        title:
          type === SearchType.TITLE_AND_CONTENT || SearchType.TITLE
            ? query
            : undefined,
      }),
      pagination,
    );
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({ id });
    if (!post) throw new NotFoundException('resource not found');

    return post;
  }

  async view(id: number) {
    const post = await this.postRepository.findOne({ id });
    if (!post) throw new NotFoundException('resource not found');

    await this.postRepository.update(
      {
        ...post,
        viewCount: post.viewCount + 1,
      },
      { id },
    );
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.postRepository.findOne({ id });
    const updated = { ...post, ...updatePostDto };

    return await this.postRepository.update(updated, { id });
  }

  async remove(id: number) {
    return await this.postRepository.delete({ id });
  }
}
