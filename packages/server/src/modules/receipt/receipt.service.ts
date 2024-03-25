import { writeFile } from "node:fs/promises";
import { Injectable } from "@nestjs/common";
import { GenerateProps } from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { line, readOnlyText, table, text } from "@pdfme/schemas";
import { Book, BookCopy, Sale } from "@prisma/client";
import { ReceiptType } from "src/@generated";
import { PrismaService } from "src/modules/prisma/prisma.service";
import registeredTemplate from "./templates/registered.json";

type BookCopyWithBook = BookCopy & { book: Book };
export type CreateReceiptInput = {
  userId: string;
  retailLocationId: string;
  createdById: string;
} & (
  | {
      type: ReceiptType.PURCHASE;
      data: (Sale & { bookCopy: BookCopyWithBook })[];
    }
  | {
      type: ReceiptType.REGISTRATION;
      data: BookCopyWithBook[];
    }
);

export type ReceiptBook = Pick<
  Book,
  "isbnCode" | "title" | "subject" | "originalPrice"
> & { code: string };
export interface GenerateReceiptInput {
  creationDate: Date;
  userEmail: string;
  locationName: string;
  books: ReceiptBook[];
}

@Injectable()
export class ReceiptService {
  // TODO: Make this dynamic
  readonly #collectionPeriod = {
    from: new Date(2024, 8, 13),
    to: new Date(2024, 8, 24),
  };

  constructor(private readonly prisma: PrismaService) {}

  async createReceipt({
    userId,
    retailLocationId,
    createdById,
    type,
    data,
  }: CreateReceiptInput) {
    const receipt = await this.prisma.receipt.create({
      data: {
        type,
        userId,
        retailLocationId,
        createdById,
      },
      include: {
        user: true,
        retailLocation: true,
      },
    });

    // TODO: Handle other types of receipts
    const receiptPdf = await this.generateRegistrationReceipt({
      creationDate: receipt.createdAt,
      locationName: receipt.retailLocation.name,
      userEmail: receipt.user.email,
      books: (type === ReceiptType.PURCHASE
        ? data.map(({ bookCopy }) => bookCopy)
        : data
      ).map(({ code, book }) => ({
        isbnCode: book.isbnCode,
        title: book.title,
        subject: book.subject,
        originalPrice: book.originalPrice,
        code,
      })),
    });
    // TODO: Make the directory path dynamic
    await writeFile(`./tmp-files/receipts/${receipt.id}.pdf`, receiptPdf);

    return receipt;
  }

  async generateRegistrationReceipt({
    creationDate,
    userEmail,
    locationName,
    books,
  }: GenerateReceiptInput) {
    const formattedDate = creationDate.toLocaleDateString("it-IT", {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    const bookRows = books.map((book) => [
      book.isbnCode,
      book.title,
      book.subject,
      book.originalPrice.toFixed(2),
      book.code,
    ]);
    const collectionPeriod = this.#getFormattedCollectionPeriod();

    const schema = registeredTemplate.schemas[0];
    return await generate({
      template: registeredTemplate as unknown as GenerateProps["template"],
      inputs: [
        {
          headerSubtitle: schema.headerSubtitle.content.replace(
            "{location}",
            locationName,
          ),
          headerDate: schema.headerDate.content.replace(
            "{date}",
            formattedDate,
          ),
          title: schema.title.content.replace("{email}", userEmail),
          table: JSON.stringify(bookRows),
          notice: schema.notice.content
            .replace("{from}", collectionPeriod.from)
            .replace("{to}", collectionPeriod.to),
        },
      ],
      options: {
        creationDate,
        language: "it",
        title: schema.headerTitle.content,
        // TODO: Use appropriate fonts, weights, etc.
      },
      plugins: {
        text,
        readOnlyText,
        line,
        table,
      },
    });
  }

  #getFormattedCollectionPeriod() {
    const { from, to } = this.#collectionPeriod;
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
}
