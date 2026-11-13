import {
  createHttpLink,
  from,
  InMemoryCache,
  split,
} from "@apollo/client/core";
import type { ApolloClientOptions } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { Kind, OperationTypeNode } from "graphql";
import { createClient } from "graphql-ws";
import type { StrictTypedTypePolicies } from "@/@generated/apollo-helpers";
import { useAuthService } from "@/services/auth";

const { getJwtHeader } = useAuthService();

// See https://github.com/apollographql/apollo-client/issues/6868#issuecomment-703282751
const mergeIncoming = (_existing: unknown, incoming: unknown) => incoming;

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
    uri: import.meta.env.GRAPHQL_URL,
  });

  // TODO: We could reference here "GraphQLConnectionParams" from backend to get a strong type-checking for connection params
  // See https://v4.apollo.vuejs.org/guide-composable/subscription.html
  // See https://devlms.com/react-apollo/8-subscriptions/
  const wsLink = new GraphQLWsLink(
    createClient({
      url: import.meta.env.GRAPHQL_WS_URL,
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
    import.meta.env.QUASAR_MODE === "spa"
      ? {
          //
        }
      : {},
    import.meta.env.QUASAR_MODE === "ssr"
      ? {
          //
        }
      : {},
    import.meta.env.QUASAR_MODE === "pwa"
      ? {
          //
        }
      : {},
    import.meta.env.QUASAR_MODE === "bex"
      ? {
          //
        }
      : {},
    import.meta.env.QUASAR_MODE === "cordova"
      ? {
          //
        }
      : {},
    import.meta.env.QUASAR_MODE === "capacitor"
      ? {
          //
        }
      : {},
    import.meta.env.QUASAR_MODE === "electron"
      ? {
          //
        }
      : {},

    // dev/prod options.
    import.meta.env.QUASAR_DEV
      ? {
          //
        }
      : {},
    import.meta.env.QUASAR_PROD
      ? {
          //
        }
      : {},

    // For ssr mode, when on server.
    import.meta.env.QUASAR_SSR_MODE && import.meta.env.QUASAR_SERVER
      ? {
          ssrMode: true,
        }
      : {},
    // For ssr mode, when on client.
    import.meta.env.QUASAR_SSR_MODE && import.meta.env.QUASAR_CLIENT
      ? {
          ssrForceFetchDelay: 100,
        }
      : {},
  ) as ApolloClientOptions<unknown>;
}
