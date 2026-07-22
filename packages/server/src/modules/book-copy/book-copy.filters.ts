import type { Prisma } from "@prisma/client";

export const noSalesOrRefundedSalesFilter = {
  sales: {
    none: {
      refundedAt: null,
    },
  },
} satisfies Prisma.BookCopyWhereInput;
export const noProblemsOrResolvedProblemsFilter = {
  problems: {
    none: {
      resolvedAt: null,
    },
  },
} satisfies Prisma.BookCopyWhereInput;

export const availableBookCopyFilter = {
  returnedAt: null,
  donatedAt: null,
  AND: [noSalesOrRefundedSalesFilter, noProblemsOrResolvedProblemsFilter],
} satisfies Prisma.BookCopyWhereInput;
