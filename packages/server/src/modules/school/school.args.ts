import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class SchoolCoursesArgs {
  @Field(() => [String])
  schoolCodes!: string[];
}
