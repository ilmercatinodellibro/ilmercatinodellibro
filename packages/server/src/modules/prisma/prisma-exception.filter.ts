import {
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter
  implements ExceptionFilter<Prisma.PrismaClientKnownRequestError>
{
  catch(exception: Prisma.PrismaClientKnownRequestError) {
    if (exception.code === "P2002") {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const modelName = exception.meta!.modelName as string | undefined;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const target = exception.meta!.target as string[];

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
