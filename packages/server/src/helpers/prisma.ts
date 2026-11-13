import type { Prisma, PrismaClient } from "src/@generated/prisma/client";

/**
 * Prisma doesn't allow everything to be used as an input value.
 * So, we need to convert the input to a JSON string and then parse it back to allowed input values.
 * It also doesn't allow null, so we need to convert it to undefined.
 */
export const toPrismaJSONInput = (input: unknown) =>
  // structuredClone() would keep the values Prisma doesn't accept, e.g. Date and undefined
  // eslint-disable-next-line unicorn/prefer-structured-clone
  (JSON.parse(JSON.stringify(input)) ?? undefined) as Prisma.InputJsonValue;

// Prisma doesn't export a specific type for this. We need it because we are passing the client around within transactions.
export type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
