import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class SchoolQueryPayload {
  @Field(() => String)
  retailLocationId!: string;
}

@ArgsType()
export class SchoolCoursesArgs {
  @Field(() => [String])
  schoolCodes!: string[];
}
