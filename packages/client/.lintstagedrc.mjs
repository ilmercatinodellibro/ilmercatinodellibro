// eslint-disable-next-line no-restricted-imports -- we can't really use aliases here
import {
  createFormatHandler,
  createLintHandler,
  createStylelintHandler,
} from "../../.lintstagedrc.mjs";

export default {
  "*.{html,graphql,md,json,yml}": createFormatHandler(),
  "*.{js,cjs,mjs,ts,vue}": [
    createFormatHandler(),
    createLintHandler(import.meta.dirname),
  ],
  "*.{css,scss,vue}": [createFormatHandler(), createStylelintHandler()],
};
