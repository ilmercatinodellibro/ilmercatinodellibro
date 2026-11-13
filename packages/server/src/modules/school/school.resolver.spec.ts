import { Test } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrismaService } from "../prisma/prisma.service.js";
import { SchoolResolver } from "./school.resolver.js";

describe("SchoolResolver", () => {
  let resolver: SchoolResolver;
  const prisma = {
    school: { findMany: vi.fn() },
    schoolCourse: { findMany: vi.fn() },
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [SchoolResolver],
    })
      .useMocker((token) => {
        if (token === PrismaService) {
          return prisma;
        }
      })
      .compile();

    resolver = moduleRef.get(SchoolResolver);
  });

  it("should list the schools of the province of the retail location, ignoring the case, by name", async () => {
    await resolver.schools({ retailLocationId: "mo" });

    expect(prisma.school.findMany).toHaveBeenCalledWith({
      where: { provinceCode: { equals: "mo", mode: "insensitive" } },
      orderBy: { name: "asc" },
    });
  });

  it("should list the courses of the schools with their school, by school, grade and section", async () => {
    await resolver.schoolCourses({ schoolCodes: ["school-1", "school-2"] });

    expect(prisma.schoolCourse.findMany).toHaveBeenCalledWith({
      where: { schoolCode: { in: ["school-1", "school-2"] } },
      include: { school: true },
      orderBy: [{ schoolCode: "asc" }, { grade: "asc" }, { section: "asc" }],
    });
  });
});
