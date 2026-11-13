import { createRequire, type ResolveHookSync } from "node:module";
import { pathToFileURL } from "node:url";

// The tests import the generated GraphQL documents from the app, which is
// written for a bundler. This hook resolves two things the way Vite does:
// - "x.graphql" imports map to the generated "x.graphql.ts" files. Playwright
//   resolves an import to an existing file before it tries the ".ts" extension,
//   so it would load the raw GraphQL document otherwise.
// - Directory imports of packages without an exports map, such as
//   "@apollo/client/core", resolve through the directory's package.json.
// It is a stopgap. A test-only codegen target with the documents replaces it.
const GRAPHQL_EXTENSION = ".graphql";
const MODULE_NOT_FOUND = "ERR_MODULE_NOT_FOUND";
const UNSUPPORTED_DIRECTORY_IMPORT = "ERR_UNSUPPORTED_DIR_IMPORT";

function errorCode(error: unknown) {
  const { code } = error as { code?: string };
  return code;
}

export const resolve: ResolveHookSync = (specifier, context, nextResolve) => {
  if (specifier.endsWith(GRAPHQL_EXTENSION)) {
    try {
      return nextResolve(`${specifier}.ts`, context);
    } catch (error) {
      if (errorCode(error) !== MODULE_NOT_FOUND) {
        throw error;
      }

      // Not a generated document, resolve the file as it is
      return nextResolve(specifier, context);
    }
  }

  try {
    return nextResolve(specifier, context);
  } catch (error) {
    if (
      errorCode(error) !== UNSUPPORTED_DIRECTORY_IMPORT ||
      !context.parentURL
    ) {
      throw error;
    }

    const require = createRequire(context.parentURL);
    return {
      url: pathToFileURL(require.resolve(specifier)).href,
      shortCircuit: true,
    };
  }
};
