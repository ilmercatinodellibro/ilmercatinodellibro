import { Injectable } from "@nestjs/common";
import { PrismaTransactionClient } from "prisma/seeds";

@Injectable()
export class BookCopyService {
  async calculateBookCodes(
    prisma: PrismaTransactionClient,
    bookIds: string[],
    retailLocationId: string,
  ) {
    const { warehouseMaxBlockSize } =
      await prisma.retailLocation.findFirstOrThrow({
        where: {
          id: retailLocationId,
        },
      });
    const useFragmentation = bookIds.length > warehouseMaxBlockSize;

    return this.#getMaxAssignedNumber(
      prisma,
      retailLocationId,
      bookIds.length,
      useFragmentation,
    );
  }

  async #getMaxAssignedNumber(
    prisma: PrismaTransactionClient,
    retailLocationId: string,
    numberOfCodesToGenerate: number,
    useFragmentation = false,
  ) {
    const currentlyAssignedCodes = (
      await prisma.bookCopy.findMany({
        select: {
          code: true,
        },
        where: {
          // Only book copies belonging to current retailLocation are considered
          book: {
            retailLocationId,
          },
          // Those copies must not have been sold, this means that all its sales have been refunded
          sales: {
            every: {
              refundedAt: {
                not: null,
              },
            },
          },
          problems: {
            every: {
              resolvedAt: {
                not: null,
              },
            },
          },
        },
        orderBy: {
          code: "asc",
        },
      })
    ).map(({ code }) => Number(code.split("/")[0]));

    if (currentlyAssignedCodes.length === 0 || !useFragmentation) {
      // When registering new books at the end of the current codes, we must consider also books that have been sold/returned.
      const storedMaxCode = await prisma.bookCopy.aggregate({
        _max: {
          code: true,
        },
        where: {
          // Only copies belonging to current retailLocation are considered
          book: {
            retailLocationId,
          },
        },
      });

      const currentMaxAssignedNumber = storedMaxCode._max.code
        ? storedMaxCode._max.code
        : "0000/000";
      let shelfCode = parseInt(currentMaxAssignedNumber.split("/")[0]);
      const generatedCodes: string[] = [];
      for (let i = 0; i < numberOfCodesToGenerate; i++) {
        shelfCode++;
        generatedCodes.push(`${shelfCode}`.padStart(4, "0") + "/001");
      }

      return generatedCodes;
    }

    const foundSlots: string[] = [];
    for (let i = 0; foundSlots.length < numberOfCodesToGenerate; i++) {
      if (!currentlyAssignedCodes.includes(i)) {
        foundSlots.push(`${i}`.padStart(4, "0"));
        break;
      }
    }

    const maxCodesUsedForSlots = await Promise.all(
      foundSlots.map((slotShelfCode) =>
        prisma.bookCopy.aggregate({
          _max: {
            code: true,
          },
          where: {
            // Only copies belonging to current retailLocation are considered
            book: {
              retailLocationId,
            },
            code: {
              startsWith: slotShelfCode + "/",
            },
          },
        }),
      ),
    );

    return maxCodesUsedForSlots.map((prismaCode, index) => {
      if (!prismaCode._max.code) {
        return foundSlots[index] + "/001";
      }

      const codeParts = prismaCode._max.code.split("/");
      return `${codeParts[0]}/${(parseInt(codeParts[1]) + 1)
        .toString()
        .padStart(3, "0")}`;
    });
  }
}
