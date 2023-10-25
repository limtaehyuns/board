import { Module } from '@nestjs/common';
import { RateService } from './rate.service';
import { DbService } from 'src/db/db.service';
import { RateRepository } from './entities/rate.repository';

@Module({
  providers: [RateService, RateRepository, DbService],
  exports: [RateService, RateRepository],
})
export class RateModule {}
