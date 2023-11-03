import "reflect-metadata";

import { writeFile } from "fs/promises";
import { join } from "path";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from "@nestjs/graphql";
import glob from "fast-glob";
import { printSchema } from "graphql";
import { DateScalar } from "./date.scalar";

async function generate() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const resolvers = await getResolvers(
    join(__dirname, "./modules/**/*.resolver.ts"),
  );
  const schema = await gqlSchemaFactory.create(resolvers, [DateScalar], {
    // Keep this in sync with ./app.module.ts
  });

  const schemaContents = printSchema(schema);
  const schemaPath = join(__dirname, "./@generated/schema.graphql");
  await writeFile(schemaPath, schemaContents);
  Logger.log(`Generated GraphQL schema at ${schemaPath}`);
}
void generate();

async function getResolvers(source: string | string[]) {
  const resolvers: FunctionConstructor[] = [];
  const sourceArray = Array.isArray(source) ? source : [source];
  // https://github.com/mrmlnc/fast-glob/tree/3.2.12#how-to-write-patterns-on-windows
  const normalizedSource = sourceArray.map((source) =>
    source.replace(/\\/g, "/"),
  );
  for await (const path of glob.stream(normalizedSource)) {
    // May contain multiple resolvers
    const module = (await import(path.toString())) as Record<string, unknown>;

    for (const member of Object.values(module)) {
      if (!isClass(member)) {
        continue;
      }
      // It doesn't necessarily have to be a resolver, GraphQLSchemaFactory will handle that
      resolvers.push(member);
    }
  }

  return resolvers;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isClass(obj: any): obj is typeof Function {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  return (
    !!obj.prototype &&
    !!obj.prototype.constructor &&
    !!obj.prototype.constructor.name
  );
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
}
