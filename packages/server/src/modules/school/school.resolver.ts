import { Args, Query, Resolver } from "@nestjs/graphql";
import { School, SchoolCourse } from "src/@generated";
import { SchoolCoursesArgs } from "src/modules/school/school.args";
import { PrismaService } from "../prisma/prisma.service";

@Resolver()
export class SchoolResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [School])
  async schools() {
    return await this.prisma.school.findMany({});
  }

  @Query(() => [SchoolCourse])
  async schoolCourses(@Args() { schoolCodes }: SchoolCoursesArgs) {
    return await this.prisma.schoolCourse.findMany({
      where: { schoolCode: { in: schoolCodes } },
    });
  }
}
