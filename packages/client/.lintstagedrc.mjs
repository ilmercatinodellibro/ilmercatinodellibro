import { URL } from "node:url";
// eslint-disable-next-line no-restricted-imports -- we can't really use aliases here
import {
  createFormatHandler,
  createLintHandler,
  createStylelintHandler,
} from "../../.lintstagedrc.mjs";

const __dirname = new URL(".", import.meta.url).pathname;

export default {
  "*.{html,graphql,md,json,yml}": createFormatHandler(),
  "*.{js,cjs,mjs,ts,vue}": [
    createFormatHandler(),
    createLintHandler(__dirname),
  ],
  "*.{css,scss,vue}": [createFormatHandler(), createStylelintHandler()],
};
