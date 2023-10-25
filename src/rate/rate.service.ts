import { BadRequestException, Injectable } from '@nestjs/common';
import { RateRepository } from './entities/rate.repository';
import { RateType } from './dto/create-rate.dto';

@Injectable()
export class RateService {
  constructor(private rateRepository: RateRepository) {}

  async create(rate: RateType, postId?: number, commentId?: number) {
    this.rateRepository.insertQueue({ rate, postId, commentId });
  }

  async getRate(postId?: number, commentId?: number) {
    if (postId === undefined && commentId === undefined)
      throw new BadRequestException('postId or commentId is required');

    return this.rateRepository.getRate(postId, commentId);
  }
}
