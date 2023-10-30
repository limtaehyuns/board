import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Board {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  title: string;

  @Field(() => String)
  slug: string;

  @Field(() => [Board], { nullable: true })
  boards?: Board[];

  @Field(() => Number, { nullable: true })
  parentId?: number;
}
