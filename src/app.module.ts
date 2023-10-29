import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { CacheModule } from '@nestjs/cache-manager';
import { BoardModule } from './board/board.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      driver: ApolloDriver,
    }),
    CacheModule.register({ isGlobal: true, store: 'memory' }),
    DbModule,
    BoardModule,
  ],
})
export class AppModule {}
