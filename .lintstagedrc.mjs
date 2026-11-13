// TODO: Find a way to abstract/simplify the structure to make it easily re-usable
// Import this file to use it as a base in package specific config files

import { ESLint } from "eslint";

/**
 * @param {string} baseDirectory
 *
 * @example
 * import { createLintHandler } from '../../.lintstagedrc.mjs';
 *
 * export default {
 *   '*.{js,ts,vue}': createLintHandler(import.meta.dirname),
 * }
 */
export function createLintHandler(baseDirectory) {
  return async (/** @type {string[]} */ files) => {
    const filesToLint = await filterFilesToLint(files, baseDirectory);

    return `eslint --cache --fix --max-warnings=0 ${filesToLint}`;
  };
}

export function createFormatHandler() {
  return "prettier --write --ignore-path .gitignore";
}

export function createStylelintHandler() {
  return "stylelint --cache --fix --report-needless-disables --max-warnings=0";
}

export default {
  "*.{html,graphql,md,json,yml}": createFormatHandler(),
  "*.{css,scss}": [createFormatHandler(), createStylelintHandler()],
  "*.{js,ts,cjs,mjs}": [createFormatHandler(), createLintHandler()],
};

/**
 * @param {string[]} files
 * @param {string} cwd
 *
 * @see https://github.com/okonet/lint-staged/tree/v12.3.4#how-can-i-ignore-files-from-eslintignore
 */
async function filterFilesToLint(files, cwd) {
  const eslint = new ESLint({ cwd });
  const isIgnored = await Promise.all(
    files.map((file) => {
      return eslint.isPathIgnored(file);
    }),
  );
  const filteredFiles = files.filter((_, index) => !isIgnored[index]);
  return filteredFiles.join(" ");
}
