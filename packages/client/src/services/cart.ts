import {
  useAddToCartMutation,
  useDeleteCartMutation,
  useFinalizeCartMutation,
  useOpenCartMutation,
  useRemoveFromCartMutation,
} from "./cart.graphql";

export function useCartService() {
  return {
    useOpenCartMutation,
    useDeleteCartMutation,
    useAddToCartMutation,
    useRemoveFromCartMutation,
    useFinalizeCartMutation,
  };
}
