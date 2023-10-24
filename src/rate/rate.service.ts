import { BadRequestException, Injectable } from '@nestjs/common';
import { Rate } from './entities/rate.entity';
import { DbService } from 'src/db/db.service';

@Injectable()
export class RateService {
  constructor(private dbRepository: DbService<Rate>) {}

  async create(postId?: number, commentId?: number, rate?: 0 | 1) {
    const userId = 1;
    const createdAt = new Date();

    if ((postId === undefined && commentId === undefined) || rate === undefined)
      throw new BadRequestException(
        'postId or commentId is required\nrate is must be 0 or 1',
      );

    const [exist] = await this.dbRepository.where('rates', {
      userId,
      postId: postId,
      commentId: commentId,
    });
    if (exist && exist.rate === rate)
      return await this.dbRepository.delete('rates', exist); // if exist and rate is same, delete rate datas
    if (exist && exist.rate !== rate)
      return await this.update(rate, postId, commentId); // if exist but rate is different, update rate datas

    return await this.dbRepository.create('rates', {
      postId,
      commentId,
      rate,
      userId,
      createdAt,
    }); // none exist, create rate datas
  }

  async getRate(postId?: number, commentId?: number) {
    if (postId === undefined && commentId === undefined) {
      console.log(postId, commentId);

      throw new BadRequestException('postId or commentId is required');
    }

    const db = await this.dbRepository.where('rates', { postId, commentId });
    const like = db.filter((rate) => rate.rate === 1).length;
    const dislike = db.filter((rate) => rate.rate === 0).length;

    return { like, dislike };
  }

  async update(rate: 0 | 1, postId?: number, commentId?: number) {
    const userId = 1;

    if (postId === undefined && commentId === undefined)
      throw new BadRequestException('postId or commentId is required');

    const [exist] = await this.dbRepository.where('rates', {
      userId,
      postId,
      commentId,
    });
    if (!exist) throw new BadRequestException('rate not found');

    return await this.dbRepository.update(
      'rates',
      { postId, commentId },
      { ...exist, rate },
    );
  }

  async remove(postId?: number, commentId?: number) {
    const userId = 1;

    if (postId === undefined && commentId === undefined)
      throw new BadRequestException('postId or commentId is required');

    const [rate] = await this.dbRepository.where('rates', {
      userId,
      postId,
      commentId,
    });

    return await this.dbRepository.delete('rates', rate);
  }
}
