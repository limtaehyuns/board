import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class BoardDto {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  slug: string;

  @Field(() => [BoardDto], { nullable: true })
  boards: BoardDto[];
}
