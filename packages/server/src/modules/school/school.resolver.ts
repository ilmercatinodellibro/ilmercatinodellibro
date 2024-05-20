import { Args, Query, Resolver } from "@nestjs/graphql";
import { School, SchoolCourse } from "src/@generated";
import {
  SchoolCoursesArgs,
  SchoolQueryPayload,
} from "src/modules/school/school.args";
import { PrismaService } from "../prisma/prisma.service";

@Resolver()
export class SchoolResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [School])
  async schools(@Args() { retailLocationId }: SchoolQueryPayload) {
    return await this.prisma.school.findMany({
      where: {
        provinceCode: retailLocationId.toLocaleUpperCase(),
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  @Query(() => [SchoolCourse])
  async schoolCourses(@Args() { schoolCodes }: SchoolCoursesArgs) {
    return await this.prisma.schoolCourse.findMany({
      where: { schoolCode: { in: schoolCodes } },
      include: {
        school: true,
      },
      orderBy: {
        grade: "asc",
      },
    });
  }
}
