import {
  useAddToCartMutation,
  useOpenCartMutation,
  useRemoveFromCartMutation,
} from "./cart.graphql";

export function useCartService() {
  return {
    useOpenCartMutation,
    useAddToCartMutation,
    useRemoveFromCartMutation,
  };
}
