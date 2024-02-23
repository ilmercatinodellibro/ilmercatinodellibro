import {
  useAddToCartMutation,
  useFinalizeCartMutation,
  useOpenCartMutation,
  useRemoveFromCartMutation,
} from "./cart.graphql";

export function useCartService() {
  return {
    useOpenCartMutation,
    useAddToCartMutation,
    useRemoveFromCartMutation,
    useFinalizeCartMutation,
  };
}
