import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Prisma doesn't allow everything to be used as an input value.
 * So, we need to convert the input to a JSON string and then parse it back to allowed input values.
 * It also doesn't allow null, so we need to convert it to undefined.
 */
export const toPrismaJSONInput = (input: unknown) =>
  (JSON.parse(JSON.stringify(input)) ?? undefined) as Prisma.InputJsonValue;

// Prisma doesn't export a specific type for this. We need it because we are passing the client around within transactions.
export type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
