import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateBoardInput {
  @Field(() => String, { description: 'Title' })
  title!: string;

  @Field(() => String, { description: 'Url' })
  slug!: string;

  @Field(() => Int, { description: 'Parent id', nullable: true })
  parentId?: number;
}
