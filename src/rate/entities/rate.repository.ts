import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'src/db/repository';
import { Rate } from './rate.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreateRateDto, RateType } from '../dto/create-rate.dto';
import { EventEmitter } from 'events';

interface RateQueue extends CreateRateDto {
  createdAt: Date;
}

@Injectable()
export class RateRepository extends Repository<Rate> {
  private queue: RateQueue[] = [];
  private emitter = new EventEmitter();

  constructor(
    @Inject(CACHE_MANAGER)
    protected readonly cacheManager: Cache,
  ) {
    super('rates');
    this.processQueue();
  }

  async processQueue() {
    while (true) {
      if (this.queue.length > 0) {
        const data = this.queue.shift();
        console.log(data, 'processQueue');
        await this.create(data);
      } else {
        await this.waitEvents();
      }
    }
  }

  async waitEvents() {
    return new Promise((resolve) => {
      this.emitter.on('event', resolve);
    });
  }

  async getRate(postId?: number, commentId?: number) {
    const prefix = postId ? `post-${postId}` : `comment-${commentId}`;
    const cachedValue = (await this.cacheManager.get(prefix)) as
      | string
      | undefined;

    if (cachedValue) {
      return JSON.parse(cachedValue);
    }

    const db = await this.where({ postId, commentId });
    const like = db.filter((rate) => rate.rate === 1).length;
    const dislike = db.length - like;

    await this.cacheManager.set(
      prefix,
      JSON.stringify({ like, dislike }),
      1000 * 10,
    );

    return { like, dislike };
  }

  async insertQueue(data: CreateRateDto): Promise<void> {
    const createdAt = new Date();
    this.queue.push({ ...data, createdAt });
    this.emitter.emit('event');
  }

  async create(data: RateQueue): Promise<void> {
    const { postId, commentId, rate, createdAt } = data;
    const userId = 1;

    const [exist] = await this.where({ userId, postId, commentId });
    const prefix = postId ? 'post-' + postId : 'comment-' + commentId;
    const cachedData = (await this.cacheManager.get(prefix))
      ? JSON.parse((await this.cacheManager.get(prefix)) as string)
      : { like: 0, dislike: 0 };

    if (exist && exist.rate === rate) {
      await super.delete({ postId, commentId, userId });

      if (rate === RateType.LIKE) cachedData.like -= 1;
      else cachedData.dislike -= 1;

      await this.cacheManager.set(
        prefix,
        JSON.stringify(cachedData),
        1000 * 10,
      );
      return;
    }
    if (exist && exist.rate !== rate) {
      await this.update({ postId, commentId, userId, ...exist });

      if (rate === RateType.LIKE) {
        cachedData.like += 1;
        cachedData.dislike -= 1;
      } else {
        cachedData.dislike += 1;
        cachedData.dislike -= 1;
      }

      await this.cacheManager.set(
        prefix,
        JSON.stringify(cachedData),
        1000 * 10,
      );
      return;
    }

    await super.insert({
      postId,
      commentId,
      rate,
      userId,
      createdAt,
    });

    if (rate === RateType.LIKE) cachedData.like += 1;
    else cachedData.dislike += 1;

    await this.cacheManager.set(prefix, JSON.stringify(cachedData), 1000 * 10);
  }

  async update(data: Rate): Promise<void> {
    const { postId, commentId, rate } = data;
    const userId = 1;

    const exist = await super.findOne({ userId, postId, commentId });
    if (!exist) throw new Error('rate not found');

    await super.update({ ...exist, rate }, exist);
  }
}
