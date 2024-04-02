import { Field, InputType, PickType } from "@nestjs/graphql";
import { Problem } from "src/@generated";

@InputType()
export class ProblemCreateInput extends PickType(Problem, ["details", "type"]) {
  @Field(() => String)
  bookCopyId!: string;
}

@InputType()
export class ProblemResolveInput extends PickType(
  Problem,
  ["id", "solution"],
  InputType,
) {}
