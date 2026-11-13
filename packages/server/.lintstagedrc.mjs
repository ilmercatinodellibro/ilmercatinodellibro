// eslint-disable-next-line no-restricted-imports -- we can't really use aliases here
import {
  createFormatHandler,
  createLintHandler,
} from "../../.lintstagedrc.mjs";

export default {
  "*.{graphql,md,json,yml,prisma}": createFormatHandler(),
  "*.{js,cjs,mjs,ts}": [
    createFormatHandler(),
    createLintHandler(import.meta.dirname),
  ],
};
