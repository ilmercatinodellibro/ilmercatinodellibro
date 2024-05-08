import { ApolloCache } from "@apollo/client";
import {
  TypedDocumentNode,
  VariablesOf,
} from "@graphql-typed-document-node/core";
import { Kind, OperationDefinitionNode, OperationTypeNode } from "graphql";

/**
 * Evicts a query from the cache.
 * Uses `cache.evict` under the hood, so don't forget to call
 * `cache.gc()` after calling this function, as usual.
 */
export function evictQuery<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TDocument extends TypedDocumentNode<any, any>,
  TCache,
>(
  cache: ApolloCache<TCache>,
  document: TDocument,
  args?: VariablesOf<TDocument>,
) {
  const definition = document.definitions.find(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === Kind.OPERATION_DEFINITION &&
      definition.operation === OperationTypeNode.QUERY,
  );
  if (!definition) {
    throw new Error("Document does not contain a query operation");
  }
  if (!definition.name) {
    throw new Error("Query operation does not have a name");
  }

  cache.evict({
    id: cache.identify({ __typename: "Query", id: definition.name.value }),
    args,
  });
}
