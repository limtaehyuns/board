import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DbService } from 'src/db/db.service';
import { Post } from './entities/post.entity';
import { BoardService } from 'src/board/board.service';
import { RateService } from 'src/rate/rate.service';
import { GetPostDto } from './dto/get-post.dto';
import { CommentService } from 'src/comment/comment.service';

export enum SearchType {
  TITLE = 0,
  CONTENT = 1,
  TITLE_AND_CONTENT = 2,
  NICKNAME = 3,
  COMMENT = 4,
  SLUG = 5,
}

@Injectable()
export class PostService {
  constructor(
    private readonly dbRepository: DbService<Post>,
    private readonly boardService: BoardService,
    private readonly rateService: RateService,
    private readonly commentService: CommentService,
  ) {}

  private async createRelations(data: Post[], comments = false) {
    const processedArray: GetPostDto[] = await Promise.all(
      data.map(async (post: Post) => {
        const rate = await this.rateService.getRate(post.id);
        const author = { nickname: '임태현', id: 1 };
        if (comments) {
          const comments = await this.commentService.findAll(post.id);
          return { ...post, rate, author, comments };
        }
        return { ...post, rate, author };
      }),
    );

    return processedArray;
  }

  private async getPosts(
    data: Post[],
    limit: number,
    offset: number,
    filter?: (post: GetPostDto) => unknown,
  ) {
    const normalPosts: Post[] = data
      .filter((post) => !post.isNotice)
      .sort((a, b) => b.id - a.id); // is Notice = false and sort by id desc
    const noticePosts: Post[] = data
      .filter((post) => post.isNotice)
      .sort((a, b) => b.id - a.id); // is Notice = true and sort by id desc

    if (filter) {
      normalPosts.filter(filter);
    }

    const postData: {
      notices: GetPostDto[];
      normal: GetPostDto[];
      pagenation: { pages: number; current: number };
    } = {
      pagenation: {
        pages: Math.ceil(normalPosts.length / limit),
        current: Math.ceil((offset * limit) / limit) + 1,
      },
      notices: await this.createRelations(noticePosts),
      normal: (await this.createRelations(normalPosts)).slice(
        offset * limit,
        limit + offset * limit,
      ),
    };

    return postData;
  }

  private searchSlugInTree(tree, targetSlug) {
    const result = [];

    function search(node, root) {
      if (root) {
        if (node.slug === targetSlug) {
          result.push(node.id);
          search(node.children, false);
        } else {
          for (const child of node.children) {
            search(child, true);
          }
        }
      } else {
        for (const child of node) {
          result.push(child.id);
          search(child.children, false);
        }
      }
    }

    for (const node of tree) {
      search(node, true);
    }

    return result;
  }

  async isPostExist(id: number) {
    const [post] = await this.dbRepository.where('posts', { id });
    if (!post) throw new NotFoundException('resource not found');

    return true;
  }

  async create(createPostDto: CreatePostDto) {
    const id = (await this.dbRepository.getLastId('posts')) + 1;
    const userId = 1;
    const createdAt = new Date();

    const board = await this.boardService.findOne(createPostDto.boardId);
    if (!board) throw new NotFoundException('board resource not found');

    const newPost: Post = {
      id,
      userId,
      createdAt,
      viewCount: 0,
      ...createPostDto,
    };
    return await this.dbRepository.create('posts', newPost);
  }

  async findAll(limit: number, offset: number) {
    const db = await this.dbRepository.where('posts');

    const postData = await this.getPosts(db, limit, offset);
    return { ...postData };
  }

  async searchBySlug(limit: number, offset: number, slug: string) {
    const board = await this.boardService.findAll(); // get board tree
    const slugs = this.searchSlugInTree(board, slug); // get boardIds from slug

    const db = await this.dbRepository.where('posts'); // get all posts from slug
    return await this.getPosts(db, limit, offset, (post) =>
      slugs.includes(post.boardId),
    ); // return all posts from slug
  }

  async searchByQuery(
    limit: number,
    offset: number,
    type: SearchType,
    query?: string,
  ) {
    const db = await this.dbRepository.where('posts');
    const board = await this.boardService.findAll();
    const slug = this.searchSlugInTree(board, query);

    return await this.getPosts(db, limit, offset, (post) => {
      switch (type) {
        case SearchType.TITLE:
          return post.title.includes(query);
        case SearchType.CONTENT:
          return post.content.includes(query);
        case SearchType.TITLE_AND_CONTENT:
          return post.title.includes(query) || post.content.includes(query);
        case SearchType.NICKNAME:
          return post.author.nickname.includes(query);
        case SearchType.SLUG:
          return slug.includes(post.boardId);
      }
    });
  }

  async findOne(id: number) {
    const [post] = await this.dbRepository.where('posts', { id });
    if (!post) throw new NotFoundException('resource not found');

    post.viewCount += 1;
    await this.dbRepository.update('posts', { id }, post);

    return (await this.createRelations([post], true))[0];
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const [post] = await this.dbRepository.where('posts', { id });
    const updated = { ...post, ...updatePostDto };

    return await this.dbRepository.update('posts', { id }, updated);
  }

  async remove(id: number) {
    const [post] = await this.dbRepository.where('posts', { id });
    if (!post) throw new NotFoundException('resource not found');

    return this.dbRepository.delete('posts', { id });
  }
}
