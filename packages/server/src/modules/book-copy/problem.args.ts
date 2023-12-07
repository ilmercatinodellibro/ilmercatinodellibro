import { Field, InputType, PickType } from "@nestjs/graphql";
import { ProblemCreateInput as ProblemCreate } from "src/@generated";

@InputType()
export class ProblemCreateInput extends PickType(ProblemCreate, [
  "details",
  "type",
]) {
  @Field(() => String)
  bookCopyId!: string;
}

@InputType()
export class ProblemResolveInput {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  solution!: string;
}
