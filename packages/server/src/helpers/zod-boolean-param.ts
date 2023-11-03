import { z } from "zod";

// Zod isn't good at processing boolean values stored as strings
// See https://github.com/colinhacks/zod/issues/1630
export const booleanParamSchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");
