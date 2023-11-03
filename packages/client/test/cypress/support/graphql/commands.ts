import { clone } from "lodash"; // lodash-es doesn't work for some reason
import {
  WaitGraphqlError,
  createAliasForOperation,
  extractOperationInfo,
  getActiveAliasForOperation,
  hasOperationName,
} from "./utils";
import type { TypedDocumentNode } from "@apollo/client/core";

type CypressWaitOptions = Parameters<Cypress.Chainable["wait"]>[1];
type WaitOptions = CypressWaitOptions & {
  allowGraphqlErrors?: boolean;
  alias?: string;
};

export type GraphqlOperationDescriptor =
  | string
  | [operationName: string, resultFieldName: string]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | TypedDocumentNode<any, any>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      interceptGraphql(
        graphqlOperationDescriptor: GraphqlOperationDescriptor,
        alias?: string,
      ): Cypress.Chainable<null>;

      waitGraphql(
        graphqlOperationDescriptor: GraphqlOperationDescriptor,
        options?: WaitOptions,
      ): Cypress.Chainable<unknown>;

      withinGraphqlOperation(
        graphqlOperationDescriptor: GraphqlOperationDescriptor,
        callback: () => void,
        options?: WaitOptions,
      ): Cypress.Chainable;

      withinGraphqlOperations(
        graphqlOperationDescriptors: GraphqlOperationDescriptor[],
        callback: () => void,
        options?: WaitOptions,
      ): Cypress.Chainable;
    }
  }
}

export function registerCommands(graphqlEndpoint?: string) {
  const endpoint =
    graphqlEndpoint ?? (Cypress.env("graphqlEndpoint") as string | undefined);
  if (endpoint === undefined) {
    throw new Error(
      "No graphqlEndpoint provided. Please set it in cypress.env.json or pass it as an argument to registerCommands()",
    );
  }

  Cypress.Commands.add(
    "interceptGraphql",
    (graphqlOperationDescriptor, providedAlias) => {
      const { operationName } = extractInfo(graphqlOperationDescriptor);
      // We create it ahead of time so that it doesn't conflict with other requests
      // due to Cypress' async nature. If we create it during the intercept() callback,
      // the counter might be incremented in the order we don't expect
      const alias = providedAlias ?? createAliasForOperation(operationName);

      return cy.intercept("POST", endpoint, (request) => {
        if (!hasOperationName(request, operationName)) {
          return;
        }

        request.alias = alias;
      });
    },
  );

  Cypress.Commands.add("waitGraphql", waitGraphqlCommand);

  Cypress.Commands.add("withinGraphqlOperation", withinGraphqlOperationCommand);

  Cypress.Commands.add(
    "withinGraphqlOperations",
    withinGraphqlOperationsCommand,
  );
}

const waitGraphqlCommand: Cypress.CommandFn<"waitGraphql"> = (
  graphqlOperationDescriptor,
  { allowGraphqlErrors, alias, ...options } = {},
) => {
  const { operationName, fieldName } = extractInfo(graphqlOperationDescriptor);
  const activeAlias = alias ?? getActiveAliasForOperation(operationName);

  // Due to Cypress' nature, we create a chain of then() blocks to be able to
  // log the error-related info if the operation failed
  return (
    cy
      .wait(`@${activeAlias}`, options)
      .then(({ response, request, error }) => {
        if (error) {
          return new WaitGraphqlError(
            `GraphQL operation "${operationName}" failed with a request error`,
            {
              cause: error,
              response,
              request,
            },
          );
        }

        const body = response?.body as
          | undefined
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          | { data?: Record<string, any> | null; errors?: unknown[] };

        if (body?.data === undefined) {
          return new WaitGraphqlError(
            `GraphQL operation "${operationName}" failed because the response is malformed`,
            { cause: "MALFORMED_RESPONSE", request, response },
          );
        }

        if (body.errors !== undefined && body.errors.length > 0) {
          return new WaitGraphqlError(
            `GraphQL operation "${operationName}" failed with a GraphQL error`,
            {
              cause: "GRAPHQL_ERROR",
              response,
              request,
            },
          );
        }

        if (body.data === null || !(fieldName in body.data)) {
          return new WaitGraphqlError(
            `GraphQL operation "${operationName}" failed because the response does not contain the field "${fieldName}"`,
            {
              cause: "FIELD_NOT_FOUND",
              response,
              request,
            },
          );
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return body.data[fieldName];
      })
      // Log the error-related info if the operation failed, return the result in any case
      .then((result) => {
        cy.log(`GraphQL operation "${operationName}" was executed`);

        if (
          result instanceof WaitGraphqlError &&
          !(allowGraphqlErrors && result.cause === "GRAPHQL_ERROR")
        ) {
          const { request, response } = result;

          // Authorization header is not logged since it's very long and should not be needed for debugging
          const requestInfo = clone(request);
          delete requestInfo.headers.Authorization;
          delete requestInfo.headers.authorization;
          cy.log(
            "Request info (except Authorization header):",
            JSON.stringify(requestInfo, null, 2),
          );

          cy.log("Response info:", JSON.stringify(response, null, 2));
        }

        // Promise.resolve() is needed to be able to use cy commands in this block
        // The next block will receive the resolved value
        return Promise.resolve(result);
      })
      // After the Cypress execution in the previous then() blocks are done,
      // throw the error if it's an instance of WaitGraphqlError, otherwise return the result
      .then((result) => {
        if (
          result instanceof WaitGraphqlError &&
          !(allowGraphqlErrors && result.cause === "GRAPHQL_ERROR")
        ) {
          throw result;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result;
      })
  );
};

const withinGraphqlOperationCommand: Cypress.CommandFn<
  "withinGraphqlOperation"
> = (graphqlOperationDescriptor, callback, options) => {
  const { operationName } = extractInfo(graphqlOperationDescriptor);
  // interceptGraphql() and waitGraphql() already handles unique aliasing.
  // But, due to the async nature of Cypress, there might be racing conditions
  // with the following cy chain. So, we create a unique alias ahead of time.
  // This way, nested or consecutive interceptions will not conflict with each other.
  const alias = createAliasForOperation(operationName);

  return cy.interceptGraphql(graphqlOperationDescriptor, alias).then(() => {
    callback();

    return cy
      .waitGraphql(graphqlOperationDescriptor, {
        ...options,
        alias,
      })
      .as(`${operationName}Result`);
  });
};

const withinGraphqlOperationsCommand: Cypress.CommandFn<
  "withinGraphqlOperations"
> = (graphqlOperationDescriptors, callback, options) => {
  if (graphqlOperationDescriptors.length === 0) {
    throw new Error("No operations provided");
  }

  graphqlOperationDescriptors.forEach((operation) => {
    cy.interceptGraphql(operation);
  });

  callback();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastOperation = graphqlOperationDescriptors.pop()!;
  for (const operation of graphqlOperationDescriptors) {
    const { operationName } = extractInfo(operation);
    cy.waitGraphql(operation, options).as(`${operationName}Result`);
  }

  const { operationName } = extractInfo(lastOperation);
  // TODO: Consider returning an array of results instead, if needed
  return cy.waitGraphql(lastOperation, options).as(`${operationName}Result`);
};

function extractInfo(graphqlOperationDescriptor: GraphqlOperationDescriptor) {
  if (typeof graphqlOperationDescriptor === "string") {
    return {
      operationName: graphqlOperationDescriptor,
      fieldName: graphqlOperationDescriptor,
    };
  }

  if (Array.isArray(graphqlOperationDescriptor)) {
    const [operationName, fieldName] = graphqlOperationDescriptor;
    return {
      operationName,
      fieldName,
    };
  }

  return extractOperationInfo(graphqlOperationDescriptor);
}
