import { Repository } from 'src/db/repository';
import { Post } from './post.entity';
import { RateService } from 'src/rate/rate.service';
import { BoardService } from 'src/board/board.service';
import { Where } from 'src/interface/Query';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostRepository extends Repository<Post> {
  constructor(
    private readonly rateSerivce: RateService,
    private readonly boardService: BoardService,
  ) {
    super('posts');
  }

  private createChildrenTree(boards: any[]) {
    const itemMap = new Map();
    const root = [];

    for (const item of boards) {
      item.children = [];
      itemMap.set(item.id, item);
    }

    for (const item of boards) {
      if (item.parentId !== item.id) {
        const parentItem = itemMap.get(item.parentId);
        if (parentItem) {
          parentItem.children.push(item);
        } else {
          root.push(item);
        }
      } else {
        root.push(item);
      }
    }

    return root;
  }

  async searchSlug(targetSlug) {
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

    for (const node of this.createChildrenTree(
      await this.boardService.findAllWithoutPagination(),
    )) {
      search(node, true);
    }

    return result;
  }

  async createRelations(data: Post[]) {
    const processedArray: Post[] = await Promise.all(
      data.map(async (post: Post) => {
        const rate = await this.rateSerivce.getRate(post.id, null);
        const author = { nickname: '임태현', id: 1 };
        return { ...post, rate, author };
      }),
    );

    return processedArray;
  }

  async where(where: Where<Post>): Promise<Post[]> {
    const posts = await super.where(where);
    return await this.createRelations(posts);
  }

  async findOne(where: Where<Post>): Promise<any> {
    const post = await super.findOne(where);
    // console.log(post);
    return await this.createRelations([post]);
  }
}
