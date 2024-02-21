import { useOpenCartMutation } from "./cart.graphql";

export function useCartService() {
  return {
    useOpenCartMutation,
  };
}
