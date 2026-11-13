import type { GraphQLFormattedError } from "graphql";
import { Notify } from "quasar";

export function notifyError(message: string, dataCy = "error-notification") {
  Notify.create({
    type: "negative",
    message,
    attrs: {
      "data-cy": dataCy,
    },
  });
}

/** The GraphQL errors of the response the error comes from, empty for errors that don't come from one */
export function getGraphQLErrors(error: unknown) {
  // Apollo errors carry the GraphQL errors of the response, other errors don't
  if (
    !(error instanceof Error) ||
    !("graphQLErrors" in error) ||
    !Array.isArray(error.graphQLErrors)
  ) {
    return [];
  }

  return error.graphQLErrors as GraphQLFormattedError[];
}

/** The HTTP status of the exception the server threw, which GraphQL keeps in the error extensions */
export function getErrorStatus(error: unknown) {
  const [firstError] = getGraphQLErrors(error);
  const originalError = firstError?.extensions?.originalError as
    { statusCode?: number } | undefined;

  return originalError?.statusCode;
}

/** Shows the message of an error the server returned */
// TODO: implement centralized error handling
export function notifyServerError(error: unknown, dataCy?: string) {
  notifyError(error instanceof Error ? error.message : String(error), dataCy);
}

// A 4xx status means the server refused the request on purpose, like an invalid input.
// A 5xx status means the server failed.
const CLIENT_ERROR_STATUS_MIN = 400;
const SERVER_ERROR_STATUS_MIN = 500;

/** Whether the server refused the request on purpose, so the caller can handle any other error as unexpected */
export function isExpectedServerError(error: unknown) {
  const status = getErrorStatus(error);
  return (
    status !== undefined &&
    status >= CLIENT_ERROR_STATUS_MIN &&
    status < SERVER_ERROR_STATUS_MIN
  );
}
