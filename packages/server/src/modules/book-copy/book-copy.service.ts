import { Injectable } from "@nestjs/common";
import { PrismaTransactionClient } from "src/helpers/prisma";

@Injectable()
export class BookCopyService {
  async calculateBookCodes(
    prisma: PrismaTransactionClient,
    bookIds: string[],
    retailLocationId: string,
  ) {
    const { warehouseMaxBlockSize } =
      await prisma.retailLocation.findUniqueOrThrow({
        where: {
          id: retailLocationId,
        },
      });
    const useFragmentation = bookIds.length <= warehouseMaxBlockSize;

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
    useFragmentation: boolean,
  ) {
    const currentlyAssignedBookCopies = await prisma.bookCopy.findMany({
      select: {
        code: true,
      },
      where: {
        // Only book copies belonging to current retailLocation are considered
        book: {
          retailLocationId,
        },
        // Only book copies that were not sold must be considered. To control this, one these two conditions must be met:
        // 1 - all existing sale records related to that copy must have been refunded -> means the book copy status is currently not sold
        // 2 - or that book copy does not have any sale record at all
        OR: [
          {
            sales: {
              every: {
                refundedAt: {
                  not: null,
                },
              },
            },
          },
          {
            sales: { none: {} },
          },
        ],
        // Book copy was not returned to the original owner during settlement operation
        returnedBy: {
          is: null,
        },
        // All books outside these three conditions, even if they have problems, must be considered present for the purposes of this function
      },
      orderBy: {
        code: "asc",
      },
    });
    const currentlyAssignedCodes = currentlyAssignedBookCopies.map(({ code }) =>
      Number.parseInt(code.split("/")[0]),
    );

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

      const currentMaxAssignedNumber = storedMaxCode._max.code ?? "0000/000";
      let shelfCode = Number.parseInt(currentMaxAssignedNumber.split("/")[0]);
      const generatedCodes: string[] = [];
      for (let index = 0; index < numberOfCodesToGenerate; index++) {
        shelfCode++;
        generatedCodes.push(`${shelfCode}`.padStart(4, "0") + "/001");
      }

      return generatedCodes;
    }

    const foundSlots: string[] = [];
    for (let index = 1; foundSlots.length < numberOfCodesToGenerate; index++) {
      if (!currentlyAssignedCodes.includes(index)) {
        foundSlots.push(`${index}`.padStart(4, "0"));
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

      const [slotShelfCode, booksPassedByThisSlotShelf] =
        prismaCode._max.code.split("/");

      return `${slotShelfCode}/${(Number.parseInt(booksPassedByThisSlotShelf) + 1).toString().padStart(3, "0")}`;
    });
  }
}
