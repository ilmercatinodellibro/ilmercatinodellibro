import {
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "src/@generated/prisma/client";

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

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter<Prisma.PrismaClientKnownRequestError> {
  catch(exception: Prisma.PrismaClientKnownRequestError) {
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

      return new NotFoundException(
        `Requested entry for ${modelName} not found`,
      );
    }

    return exception;
  }
}
