import type { Prisma } from "@prisma/client";

export const noSalesFilter: Prisma.BookCopyWhereInput = {
  sales: {
    none: {
      refundedAt: null,
    },
  },
};
export const noProblemsFilter: Prisma.BookCopyWhereInput = {
  problems: {
    none: {
      resolvedAt: null,
    },
  },
};

export const availableBookCopyFilter: Prisma.BookCopyWhereInput = {
  returnedAt: null,
  donatedAt: null,
  AND: [noSalesFilter, noProblemsFilter],
};
