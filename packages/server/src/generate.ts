import "reflect-metadata";

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from "@nestjs/graphql";
import { printSchema } from "graphql";
import { glob } from "tinyglobby";
import { DateScalar } from "./date.scalar.js";

async function generate() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const resolvers = await getResolvers(
    join(import.meta.dirname, "./modules/**/*.resolver.ts"),
  );
  const schema = await gqlSchemaFactory.create(resolvers, [DateScalar], {
    // Keep this in sync with ./app.module.ts
  });

  const schemaContents = printSchema(schema);
  const schemaPath = join(import.meta.dirname, "./@generated/schema.graphql");
  await writeFile(schemaPath, schemaContents);
  Logger.log(`Generated GraphQL schema at ${schemaPath}`);
}
await generate();

async function getResolvers(source: string | string[]) {
  const resolvers: FunctionConstructor[] = [];
  const sourceArray = Array.isArray(source) ? source : [source];
  // Backslashes are not portable glob path separators
  const normalizedSource = sourceArray.map((source) =>
    source.replaceAll("\\", "/"),
  );
  const paths = await glob(normalizedSource);
  for (const path of paths) {
    // May contain multiple resolvers
    const module = (await import(path)) as Record<string, unknown>;

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
function isClass(object: any): object is typeof Function {
  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  return (
    !!object.prototype &&
    !!object.prototype.constructor &&
    !!object.prototype.constructor.name
  );
  /* eslint-enable @typescript-eslint/no-unsafe-member-access */
}
