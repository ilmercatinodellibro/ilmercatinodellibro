import { URL } from "url";
import {
  createFormatHandler,
  createLintHandler,
} from "../../.lintstagedrc.mjs";

const __dirname = new URL(".", import.meta.url).pathname;

export default {
  "*.{graphql,md,json,yml,prisma}": createFormatHandler(),
  "*.{js,cjs,mjs,ts}": [createFormatHandler(), createLintHandler(__dirname)],
};
