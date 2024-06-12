import { Injectable } from "@nestjs/common";
import { maxBy } from "lodash";
import { PrismaTransactionClient } from "../../helpers/prisma";

@Injectable()
export class BookCopyService {
  async calculateBookCodes(
    prisma: PrismaTransactionClient,
    bookIds: string[],
    retailLocationId: string,
    bypassFragmentation?: boolean,
  ) {
    const { warehouseMaxBlockSize } =
      await prisma.retailLocation.findUniqueOrThrow({
        where: {
          id: retailLocationId,
        },
      });

    /**
     * Record containing each block and its copies
     * ```ts
     * {
     *   [blockCode: string]: copyCodes: number[]
     * }
     * ```
     */
    const blocks: Record<string, number[]> = {};

    /** All copy codes already present in stock (not sold, not returned) */
    const presentCopyCodes = await prisma.bookCopy.findMany({
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
            sales: {
              none: {},
            },
          },
        ],
        // Book copy was not returned to the original owner during settlement operation
        returnedAt: null,
        // All books outside these three conditions, even if they have problems, must be considered present for the purposes of this function
      },
      orderBy: {
        code: "asc",
      },
    });

    for (const { code } of presentCopyCodes) {
      blocks[code.split("/")[1]] = [
        ...(blocks[code.split("/")[1]] ?? []),
        parseInt(code.split("/")[0]),
      ];
    }

    const firstFreeBlock =
      parseInt(
        maxBy(Object.entries(blocks), ([block]) => parseInt(block))?.[0] ??
          "-1",
      ) + 1; // One more than the highest block code found

    if (!bypassFragmentation && bookIds.length <= warehouseMaxBlockSize) {
      // No fragmentation, all books get added to a new block
      return this.#fillFromFirstFreeBlock(
        firstFreeBlock,
        warehouseMaxBlockSize,
        bookIds,
      );
    }

    /** Array corresponding to a full block */
    const fullBlockCodes = Array(warehouseMaxBlockSize)
      .fill(null)
      .map((_, index) => index);

    const codesFromBlocksToFill: string[] = [];

    for (const [block, codes] of Object.entries(blocks)) {
      if (codes.length < warehouseMaxBlockSize) {
        codesFromBlocksToFill.push(
          ...fullBlockCodes
            .filter((code) => !codes.includes(code))
            .map((code) => {
              return this.#formattedCode(code, block);
            }),
        );
      }
    }

    return [
      ...codesFromBlocksToFill.slice(0, bookIds.length),
      ...(codesFromBlocksToFill.length < bookIds.length
        ? this.#fillFromFirstFreeBlock(
            firstFreeBlock,
            warehouseMaxBlockSize,
            bookIds.slice(codesFromBlocksToFill.length),
          )
        : []),
    ];
  }

  #fillFromFirstFreeBlock(
    firstFreeBlock: number,
    warehouseMaxBlockSize: number,
    array: string[],
  ) {
    return array.map((_, index) =>
      this.#formattedCode(
        index % warehouseMaxBlockSize,
        (firstFreeBlock + Math.trunc(index / warehouseMaxBlockSize)).toString(),
      ),
    );
  }

  #formattedCode(code: number, block: string) {
    return `${code.toString().padStart(3, "0")}/${block.padStart(3, "0")}`;
  }
}
