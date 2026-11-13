import { URL } from "node:url";
// eslint-disable-next-line no-restricted-imports -- we can't really use aliases here
import {
  createFormatHandler,
  createLintHandler,
} from "../../.lintstagedrc.mjs";

const __dirname = new URL(".", import.meta.url).pathname;

export default {
  "*.{graphql,md,json,yml,prisma}": createFormatHandler(),
  "*.{js,cjs,mjs,ts}": [createFormatHandler(), createLintHandler(__dirname)],
};
