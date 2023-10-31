import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateBoardInput {
  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Title' })
  title!: string;

  @IsString()
  @IsNotEmpty()
  @Field(() => String, { description: 'Url' })
  slug!: string;

  @IsNumber()
  @IsOptional()
  @Field(() => Int, { description: 'Parent id', nullable: true })
  parentId?: number;
}
