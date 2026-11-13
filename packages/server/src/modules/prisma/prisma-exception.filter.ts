import {
  ArgumentsHost,
  Catch,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Prisma } from "src/@generated/prisma/client.js";

interface DriverAdapterErrorMeta {
  cause?: { constraint?: { fields?: string[]; index?: string } };
}

function getUniqueConstraintFields({
  meta,
}: Prisma.PrismaClientKnownRequestError) {
  // With a driver adapter, P2002 has no `target`, the constraint is described in `driverAdapterError` instead:
  // by its fields on Prisma 6, by its index name on Prisma 7
  const driverAdapterError = meta?.driverAdapterError as
    DriverAdapterErrorMeta | undefined;
  const constraint = driverAdapterError?.cause?.constraint;
  return (meta?.target ??
    constraint?.fields ??
    (constraint?.index ? [constraint.index] : [])) as string[];
}

function toHttpException(exception: Prisma.PrismaClientKnownRequestError) {
  if (exception.code === "P2002") {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const modelName = exception.meta!.modelName as string | undefined;
    const target = getUniqueConstraintFields(exception);

    return new ConflictException(
      `Unique constraint [${target.join(", ")}] failed on ${modelName}`,
    );
  }

  if (exception.code === "P2025") {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const modelName = exception.meta!.modelName as string;

    return new NotFoundException(`Requested entry for ${modelName} not found`);
  }

  return exception;
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  override catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ) {
    const httpException = toHttpException(exception);

    // GraphQL turns the returned exception into the response errors,
    // while REST needs the response to be written, which the base filter does
    if (host.getType() === "http") {
      // eslint-disable-next-line promise/valid-params -- ExceptionFilter.catch(), not Promise.catch()
      super.catch(httpException, host);
      return;
    }

    return httpException;
  }
}
