// TODO: Find a way to abstract/simplify the structure to make it easily re-usable
// Import this file to use it as a base in package specific config files

import { ESLint } from "eslint";

/**
 * @example
 * import { URL } from 'url';
 * import { createLintHandler } from '../../.lintstagedrc.mjs';
 *
 * const __dirname = new URL('.', import.meta.url).pathname;
 *
 * export default {
 *   '*.{js,ts,vue}': createLintHandler(__dirname),
 * }
 */
export function createLintHandler(baseDir) {
  return async (files) => {
    const filesToLint = await filterFilesToLint(files, baseDir);

    return `eslint --fix --report-unused-disable-directives --max-warnings=0 ${filesToLint}`;
  };
}

export function createFormatHandler() {
  return "prettier --write --ignore-path .gitignore";
}

export function createStylelintHandler() {
  return "stylelint --fix --report-needless-disables --max-warnings=0";
}

export default {
  "*.{html,graphql,md,json,yml}": createFormatHandler(),
  "*.{css,scss}": [createFormatHandler(), createStylelintHandler()],
  "*.{js,ts,cjs,mjs}": [createFormatHandler(), createLintHandler()],
};

// https://github.com/okonet/lint-staged/tree/v12.3.4#how-can-i-ignore-files-from-eslintignore
async function filterFilesToLint(files, cwd) {
  const eslint = new ESLint({ cwd });
  const isIgnored = await Promise.all(
    files.map((file) => {
      return eslint.isPathIgnored(file);
    }),
  );
  const filteredFiles = files.filter((_, i) => !isIgnored[i]);
  return filteredFiles.join(" ");
}
