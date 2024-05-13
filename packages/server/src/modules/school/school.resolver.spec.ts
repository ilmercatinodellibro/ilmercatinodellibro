import { beforeEach, describe, expect, it } from "@jest/globals";
import { Test, TestingModule } from "@nestjs/testing";
import { SchoolResolver } from "./school.resolver";

describe("SchoolResolver", () => {
  let resolver: SchoolResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolResolver],
    }).compile();

    resolver = module.get<SchoolResolver>(SchoolResolver);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });
});
