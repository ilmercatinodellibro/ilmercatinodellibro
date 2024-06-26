import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Injectable } from "@nestjs/common";
import { GenerateProps } from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { line, readOnlyText, table, text } from "@pdfme/schemas";
import { Book, BookCopy, Receipt, Sale } from "@prisma/client";
import { sumBy } from "lodash";
import { ReceiptType } from "src/@generated";
import { MailService } from "src/modules/mail/mail.service";
import { PrismaService } from "src/modules/prisma/prisma.service";
import { RetailLocationService } from "src/modules/retail-location/retail-location.service";
import purchaseTemplate from "./templates/purchase.json";
import registrationTemplate from "./templates/registration.json";

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
      type: ReceiptType.WITHDRAWAL;
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
      subject: `Il Mercatino del Libro - Receipt of ${receipt.type.toLowerCase()}`,
      template: `${user.locale ?? "it"}/receipt`,
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
    });
  }

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

    const books = (
      type === ReceiptType.PURCHASE
        ? data.map(({ bookCopy }) => bookCopy)
        : data
    ).map(({ code, book }) => ({
      isbnCode: book.isbnCode,
      title: book.title,
      subject: book.subject,
      originalPrice: book.originalPrice,
      code,
    }));

    const generateReceipt =
      type === ReceiptType.PURCHASE
        ? this.generatePurchaseReceipt.bind(this)
        : this.generateRegistrationReceipt.bind(this);
    const receiptPdf = await generateReceipt({
      creationDate: receipt.createdAt,
      locationName: receipt.retailLocation.name,
      userEmail: receipt.user.email,
      books,
    });

    const path = this.getReceiptPath(receipt);
    await mkdir(path.directory, { recursive: true }); // Ensure the directory exists
    await writeFile(path.file, receiptPdf);

    await this.sendReceiptToUser(receipt, Buffer.from(receiptPdf));

    return receipt;
  }

  async generateRegistrationReceipt({
    creationDate,
    userEmail,
    locationName,
    books,
  }: GenerateReceiptInput) {
    const formattedDate = this.#formatCreationDate(creationDate);
    const bookRows = books.map((book) => [
      book.isbnCode,
      book.title,
      book.subject,
      book.originalPrice.toFixed(2),
      book.code,
    ]);
    const collectionPeriod = this.#getFormattedCollectionPeriod();

    const schema = registrationTemplate.schemas[0];
    return await generate({
      template: registrationTemplate as unknown as GenerateProps["template"],
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

  async generatePurchaseReceipt({
    creationDate,
    userEmail,
    locationName,
    books,
  }: GenerateReceiptInput) {
    const formattedDate = this.#formatCreationDate(creationDate);
    const bookRows = books.map((book) => [
      book.isbnCode,
      book.title,
      book.subject,
      book.originalPrice.toFixed(2),
    ]);

    const schema = purchaseTemplate.schemas[0];
    return await generate({
      template: purchaseTemplate as unknown as GenerateProps["template"],
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
          notice: schema.notice.content.replace(
            "{totalPrice}",
            sumBy(books, "originalPrice").toFixed(2),
          ),
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
