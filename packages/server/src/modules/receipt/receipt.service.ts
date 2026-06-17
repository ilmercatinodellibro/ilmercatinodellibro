import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Injectable } from "@nestjs/common";
import { generate } from "@pdfme/generator";
import { line, table, text } from "@pdfme/schemas";
import {
  Book,
  BookCopy,
  Prisma,
  Receipt,
  RetailLocation,
  Sale,
  User,
} from "@prisma/client";
import { sumBy } from "lodash";
import { ReceiptType } from "src/@generated";
import { MailService } from "src/modules/mail/mail.service";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { RetailLocationService } from "src/modules/retail-location/retail-location.service";
import purchaseTemplate from "./templates/purchase.json";
import settlementTemplate from "./templates/settlement.json";
import withdrawalTemplate from "./templates/withdrawal.json";
import type { GenerateProps, GeneratorOptions } from "@pdfme/common";

type BookCopyWithBook = BookCopy & { book: Book };
type BookCopyWithSales = BookCopy & { sales: Sale[] };
type ReceiptPayload =
  | {
      type: ReceiptType.PURCHASE;
      data: (Sale & { bookCopy: BookCopyWithBook })[];
    }
  | {
      type: ReceiptType.WITHDRAWAL;
      data: BookCopyWithBook[];
    }
  | {
      type: ReceiptType.SETTLEMENT;
      data: (BookCopyWithBook & BookCopyWithSales)[];
    };
export type CreateReceiptInput = {
  userId: string;
  retailLocationId: string;
  createdById: string;
} & ReceiptPayload;

enum SettlementType {
  RETURNED = "returned",
  DONATED = "donated",
  SOLD = "sold",
}

export interface ReceiptBook
  extends Pick<Book, "isbnCode" | "title" | "subject" | "originalPrice">,
    Pick<BookCopy, "code"> {
  settlementType?: SettlementType;
}

export interface GenerateReceiptInput {
  creationDate: Date;
  user: User;
  location: RetailLocation;
  books: ReceiptBook[];
}

interface SettlementPeriod {
  from: Date;
  to: Date;
}

const RECEIPT_SUBJECT_TRANSLATIONS: Record<
  string,
  Record<ReceiptType, string>
> = {
  it: {
    [ReceiptType.PURCHASE]: "Ricevuta per acquisto libri",
    [ReceiptType.WITHDRAWAL]: "Ricevuta per consegna libri",
    [ReceiptType.SETTLEMENT]: "Ricevuta per liquidazione",
  },
  "en-US": {
    [ReceiptType.PURCHASE]: "Book purchase receipt",
    [ReceiptType.WITHDRAWAL]: "Book consignment receipt",
    [ReceiptType.SETTLEMENT]: "Settlement receipt",
  },
};
interface BookWithBuyPrice extends ReceiptBook {
  buyPrice: number;
}

type PDFInput = Pick<GenerateProps, "template" | "inputs"> &
  Pick<GeneratorOptions, "title">;

@Injectable()
export class ReceiptService {
  // TODO: Make this dynamic and configurable from the admin panel
  readonly #settlementPeriod: Record<"re" | "mo", SettlementPeriod> = {
    re: {
      from: new Date(2026, 8, 8),
      to: new Date(2026, 8, 26),
    },
    mo: {
      from: new Date(2026, 8, 7),
      to: new Date(2026, 8, 26),
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly locationService: RetailLocationService,
  ) {}

  getReceiptPath(receipt: Receipt) {
    const directory = this.locationService.resolveStoragePath(
      receipt.retailLocationId,
      "./receipts",
    );
    const file = resolve(directory, `./${receipt.id}.pdf`);
    return { directory, file };
  }

  async sendReceiptToUser(receipt: Receipt, receiptPdf?: Buffer) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: receipt.userId },
    });

    await this.mailService.sendMail({
      to: user,
      subject: RECEIPT_SUBJECT_TRANSLATIONS[user.locale ?? "it"][receipt.type],
      template: `receipt-${receipt.type.toLowerCase()}`,
      context: {
        receipt,
        user,
      },
      attachments: [
        {
          filename: `receipt-${receipt.type.toLowerCase()}-${receipt.id}.pdf`,
          contentType: "application/pdf",
          contentDisposition: "attachment",
          content:
            receiptPdf ?? (await readFile(this.getReceiptPath(receipt).file)),
        },
      ],
      locale: user.locale,
    });
  }

  #getSettlementType({ returnedAt, donatedAt, sales }: BookCopyWithSales) {
    if (returnedAt !== null) {
      return SettlementType.RETURNED;
    }

    if (donatedAt !== null) {
      return SettlementType.DONATED;
    }

    if (
      sales.length > 0 &&
      sales.some(({ refundedAt }) => refundedAt === null)
    ) {
      return SettlementType.SOLD;
    }

    // If the book copy has not been returned, donated or sold, it means that it is not part of the settlement (e.g. still in stock)
    // and should not be included in the receipt
    return undefined;
  }

  async createReceipt(
    prisma: Prisma.TransactionClient,
    {
      userId,
      retailLocationId,
      createdById,
      ...receiptPayload
    }: CreateReceiptInput,
  ) {
    const receipt = await prisma.receipt.create({
      data: {
        type: receiptPayload.type,
        userId,
        retailLocationId,
        createdById,
      },
      include: {
        user: true,
        retailLocation: true,
      },
    });

    const books = this.#getReceiptBooks(receiptPayload);

    const receiptInput: GenerateReceiptInput = {
      creationDate: receipt.createdAt,
      location: receipt.retailLocation,
      user: receipt.user,
      books,
    };

    const { template, inputs, title } = this.#getPDFInput(
      receiptInput,
      receiptPayload.type,
    );

    const receiptPdf = (await generate({
      template,
      inputs,
      options: {
        creationDate: receiptInput.creationDate,
        lang: "it",
        title,
        // TODO: Use appropriate fonts, weights, etc.
      },
      plugins: {
        text,
        line,
        Table: table,
      },
      // Currently the type returned by generate(...) is Promise<any> because it is
      // typed as Uint8Array<...>, which is not generic in typescript < 5.7
      // TODO: remove the cast once the typescript version has been updated
    })) as Uint8Array;

    const path = this.getReceiptPath(receipt);
    await mkdir(path.directory, { recursive: true }); // Ensure the directory exists
    await writeFile(path.file, receiptPdf);

    await this.sendReceiptToUser(receipt, Buffer.from(receiptPdf));

    return receipt;
  }

  #getReceiptBooks({ type, data }: ReceiptPayload): ReceiptBook[] {
    switch (type) {
      case ReceiptType.WITHDRAWAL:
        return data.map(({ book, ...bookCopy }) => ({
          isbnCode: book.isbnCode,
          title: book.title,
          subject: book.subject,
          originalPrice: book.originalPrice,
          code: bookCopy.code,
        }));
      case ReceiptType.PURCHASE: {
        return data
          .map(({ bookCopy }) => bookCopy)
          .map(({ book, ...bookCopy }) => ({
            isbnCode: book.isbnCode,
            title: book.title,
            subject: book.subject,
            originalPrice: book.originalPrice,
            code: bookCopy.code,
          }));
      }
      // This must be managed on its own from others because we need the sales list to determine the settlement type of each book copy
      case ReceiptType.SETTLEMENT: {
        return data.map(({ book, ...bookCopy }) => ({
          isbnCode: book.isbnCode,
          title: book.title,
          subject: book.subject,
          originalPrice: book.originalPrice,
          code: bookCopy.code,
          settlementType: this.#getSettlementType(bookCopy),
        }));
      }
    }
  }

  #getPDFInput(receiptInput: GenerateReceiptInput, type: ReceiptType) {
    switch (type) {
      case ReceiptType.PURCHASE: {
        return this.generatePurchaseReceipt(receiptInput);
      }
      case ReceiptType.WITHDRAWAL: {
        return this.generateWithdrawalReceipt(receiptInput);
      }
      case ReceiptType.SETTLEMENT: {
        return this.generateSettlementReceipt(receiptInput);
      }
    }
  }

  generateWithdrawalReceipt({
    creationDate,
    user,
    location,
    books,
  }: GenerateReceiptInput): PDFInput {
    const formattedDate = this.#formatCreationDate(creationDate);
    const bookRows = books.map((book) => [
      book.isbnCode,
      book.title,
      book.subject,
      ((book.originalPrice * location.buyRate) / 100).toFixed(2),
      book.code,
    ]);
    const settlementPeriod = this.#getFormattedSettlementPeriod(
      this.#settlementPeriod[location.id as "re" | "mo"],
    );

    const headerTitle = withdrawalTemplate.schemas[0].find(
      ({ name }) => name === "headerTitle",
    )?.content;

    return {
      // JSON import broadens tuples like [number, number, number, number] to number[],
      // breaking TS compatibility due to template.basePDF.padding type
      template: withdrawalTemplate as unknown as PDFInput["template"],
      inputs: [
        {
          location: location.name,
          date: formattedDate,
          email: user.email,
          table: bookRows,
          from: settlementPeriod.from,
          to: settlementPeriod.to,
        },
      ],
      title: headerTitle,
    };
  }

  generatePurchaseReceipt({
    creationDate,
    user,
    location,
    books,
  }: GenerateReceiptInput): PDFInput {
    const formattedDate = this.#formatCreationDate(creationDate);
    const booksWithSellPrice = books.map((book) => ({
      ...book,
      sellPrice:
        (book.originalPrice *
          (user.discount ? location.buyRate : location.sellRate)) /
        100,
    }));

    const bookRows = booksWithSellPrice.map((book) => [
      book.isbnCode,
      book.title,
      book.subject,
      book.sellPrice.toFixed(2),
    ]);

    const headerTitle = purchaseTemplate.schemas[0].find(
      ({ name }) => name === "headerTitle",
    )?.content;

    return {
      // JSON import broadens tuples like [number, number, number, number] to number[],
      // breaking TS compatibility due to template.basePDF.padding type
      template: purchaseTemplate as unknown as PDFInput["template"],
      inputs: [
        {
          location: location.name,
          date: formattedDate,
          email: user.email,
          table: bookRows,
          totalPrice: sumBy(booksWithSellPrice, "sellPrice").toFixed(2),
        },
      ],

      title: headerTitle,
    };
  }

  #generateSettlementTableRows(
    books: BookWithBuyPrice[],
    type: SettlementType,
  ) {
    const tableBooks = books.filter(
      ({ settlementType }) => type === settlementType,
    );

    return tableBooks.map(({ isbnCode, buyPrice, subject, title, code }) => [
      isbnCode,
      title,
      subject,
      buyPrice.toFixed(2),
      code,
    ]);
  }

  generateSettlementReceipt({
    books,
    creationDate,
    location,
    user,
  }: GenerateReceiptInput): PDFInput {
    const formattedDate = this.#formatCreationDate(creationDate);

    const booksWithBuyPrice: BookWithBuyPrice[] = books.map((book) => ({
      ...book,
      buyPrice: (book.originalPrice * location.buyRate) / 100,
    }));

    const soldTableRows = this.#generateSettlementTableRows(
      booksWithBuyPrice,
      SettlementType.SOLD,
    );
    const returnedTableRows = this.#generateSettlementTableRows(
      booksWithBuyPrice,
      SettlementType.RETURNED,
    );
    const donatedTableRows = this.#generateSettlementTableRows(
      booksWithBuyPrice,
      SettlementType.DONATED,
    );

    const soldBooks = booksWithBuyPrice.filter(
      ({ settlementType }) => settlementType === SettlementType.SOLD,
    );
    const totalSettledAmount = sumBy(soldBooks, "buyPrice").toFixed(2);

    const headerTitle = settlementTemplate.schemas[0].find(
      ({ name }) => name === "headerTitle",
    )?.content;

    return {
      // JSON import broadens tuples like [number, number, number, number] to number[],
      // breaking TS compatibility due to template.basePDF.padding type
      template: settlementTemplate as unknown as PDFInput["template"],
      inputs: [
        {
          location: location.name,
          date: formattedDate,
          email: user.email,
          soldTable: soldTableRows,
          returnedTable: returnedTableRows,
          donatedTable: donatedTableRows,
          totalSettledAmount,
        },
      ],
      title: headerTitle,
    };
  }

  #getFormattedSettlementPeriod({ from, to }: SettlementPeriod) {
    return {
      from: from.toLocaleDateString("it-IT", {
        day: "numeric",
        month: from.getMonth() === to.getMonth() ? undefined : "long",
      }),
      to: to.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
      }),
    };
  }

  #formatCreationDate(date: Date) {
    return date.toLocaleDateString("it-IT", {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  }
}
