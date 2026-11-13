// @ts-check

/**
 * @type {import('prisma-nestjs-graphql').ExternalConfig}
 */
export default {
  // Do not generate anything else in this folder as prisma-nestjs-graphql does not play along with anything it does not generate
  output: "../src/@generated/graphql",
  prismaClientImport: "src/@generated/prisma/client.js",
  importExtension: "js",

  // We need to import directly from 'src/@generated/graphql' instead of subfolders to avoid circular dependencies
  // So, we enable this option to make it possible to import everything from the same folder
  // The patch in /patches makes the generated files import from the root barrel file as well
  reExport: "All",
  requireSingleFieldsInWhereUniqueInput: true,
  noAtomicOperations: true,
  purgeOutput: true,
  omitModelsCount: true,
  emitBlocks: ["models", "enums"],
  // Keeps relation lists as `[Type!]` like v21 did, instead of the new `[Type!]!` default
  typeListNullable: true,

  // Use JSON scalar from graphql-scalars instead of the default (graphql-type-json)
  graphqlScalars: {
    // cSpell:words GraphQLJSON
    Json: { name: "GraphQLJSON", specifier: "graphql-scalars" },
  },
};
