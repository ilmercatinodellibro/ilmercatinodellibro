import {
  createHttpLink,
  from,
  InMemoryCache,
  split,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { Kind, OperationTypeNode } from "graphql";
import { createClient } from "graphql-ws";
import { StrictTypedTypePolicies } from "src/@generated/apollo-helpers";
import { useAuthService } from "src/services/auth";
import type { ApolloClientOptions } from "@apollo/client/core";

const { getJwtHeader } = useAuthService();

export function getClientOptions() {
  const authLink = setContext((_, { headers }) => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      headers: {
        ...getJwtHeader(),
        // Existing headers should be spread after getJwtHeader to allow overriding the authentication token via context.headers in a specific query/mutation
        // This can be useful when a temporary one-shot token is provided via a query string
        ...headers,
      },
    };
  });

  const httpLink = createHttpLink({
    uri: process.env.GRAPHQL_URL,
  });

  // TODO: We could reference here "GraphQLConnectionParams" from backend to get a strong type-checking for connection params
  // See https://v4.apollo.vuejs.org/guide-composable/subscription.html
  // See https://devlms.com/react-apollo/8-subscriptions/
  const wsLink = new GraphQLWsLink(
    createClient({
      url: process.env.GRAPHQL_WS_URL,
      lazy: true,
      connectionParams: () => getJwtHeader(),
    }),
  );

  // See https://www.apollographql.com/docs/react/data/subscriptions/
  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === Kind.OPERATION_DEFINITION &&
        definition.operation === OperationTypeNode.SUBSCRIPTION
      );
    },
    wsLink,
    from([authLink, httpLink]),
  );

  // See https://github.com/apollographql/apollo-client/issues/6868#issuecomment-703282751
  const mergeIncoming = (_existing: unknown, incoming: unknown) => incoming;

  const typePolicies: StrictTypedTypePolicies = {
    Query: {
      fields: {
        events: {
          merge: mergeIncoming,
        },
        bookRequests: {
          merge: mergeIncoming,
        },
      },
    },
  };

  return Object.assign(
    // General options.
    {
      link,
      cache: new InMemoryCache({
        typePolicies,
      }),
    } as ApolloClientOptions<unknown>,
    // Specific Quasar mode options.
    process.env.MODE === "spa"
      ? {
          //
        }
      : {},
    process.env.MODE === "ssr"
      ? {
          //
        }
      : {},
    process.env.MODE === "pwa"
      ? {
          //
        }
      : {},
    process.env.MODE === "bex"
      ? {
          //
        }
      : {},
    process.env.MODE === "cordova"
      ? {
          //
        }
      : {},
    process.env.MODE === "capacitor"
      ? {
          //
        }
      : {},
    process.env.MODE === "electron"
      ? {
          //
        }
      : {},

    // dev/prod options.
    process.env.DEV
      ? {
          //
        }
      : {},
    process.env.PROD
      ? {
          //
        }
      : {},

    // For ssr mode, when on server.
    process.env.MODE === "ssr" && process.env.SERVER
      ? {
          ssrMode: true,
        }
      : {},
    // For ssr mode, when on client.
    process.env.MODE === "ssr" && process.env.CLIENT
      ? {
          ssrForceFetchDelay: 100,
        }
      : {},
  ) as ApolloClientOptions<unknown>;
}
