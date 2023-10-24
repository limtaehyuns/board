import { Module } from '@nestjs/common';
import { RateService } from './rate.service';
import { DbService } from 'src/db/db.service';

@Module({
  providers: [RateService, DbService],
})
export class RateModule {}
