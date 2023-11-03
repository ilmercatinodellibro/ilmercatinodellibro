import { getOperationDefinition } from "@apollo/client/utilities";
import { Kind } from "graphql";
import type { TypedDocumentNode } from "@apollo/client/core";
import type { CyHttpMessages } from "cypress/types/net-stubbing";

// Overriding body type since we know it can't be undefined or binary in GraphQL requests
type Req = Omit<CyHttpMessages.IncomingHttpRequest, "body"> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: Record<string, any>;
};

export const extractOperationInfo = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: TypedDocumentNode<any, any>,
) => {
  const operation = getOperationDefinition(document);
  const operationName = operation?.name?.value;
  if (!operationName) {
    throw new Error("Could not get operation name from document");
  }

  const firstSelection = operation.selectionSet.selections[0];
  if (firstSelection?.kind !== Kind.FIELD) {
    throw new Error("Could not get field name from document");
  }
  const fieldName = firstSelection.name.value;

  return { operationName, fieldName };
};

export const hasOperationName = ({ body }: Req, operationName: string) => {
  return (
    Object.hasOwn(body, "operationName") && body.operationName === operationName
  );
};

// When intercepting the same operation multiple times, requests might leak into
// each other. So, we keep track of them and make sure to alias them uniquely.
const operationMap = new Map<string, number>();
export const createAliasForOperation = (operationName: string) => {
  const count = operationMap.get(operationName) ?? 0;
  const alias = `graphql-${operationName}-${count}`;
  operationMap.set(operationName, count + 1);
  return alias;
};
/**
 * Get the alias of the last intercepted request for the given operation name.
 *
 * If you intercept the same operation consecutively, the alias will change.
 * So, if you plan to do that, save the alias in a variable before intercepting
 * the next request, then use that variable to wait for the request.
 *
 * @example cy.wait(`@${getActiveAliasForOperation("login")}`)
 */
export const getActiveAliasForOperation = (operationName: string) => {
  const nextCount = operationMap.get(operationName) ?? 1;
  return `graphql-${operationName}-${nextCount - 1}`;
};

export type WaitGraphqlErrorOptions = ErrorOptions & {
  request: CyHttpMessages.IncomingRequest;
  response?: CyHttpMessages.IncomingResponse;
};
export class WaitGraphqlError extends Error {
  request: CyHttpMessages.IncomingRequest;
  response?: CyHttpMessages.IncomingResponse;

  constructor(message: string, options: WaitGraphqlErrorOptions) {
    super(message, options);

    this.request = options.request;
    this.response = options.response;
  }
}
