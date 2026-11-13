import { defineBoot } from "#q-app";
import { ApolloClient } from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { getClientOptions } from "@/apollo";

export default defineBoot(() => {
  const options = getClientOptions();
  const apolloClient = new ApolloClient(options);

  provideApolloClient(apolloClient);
});
