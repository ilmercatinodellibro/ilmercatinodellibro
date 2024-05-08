import {
  useAddToCartMutation,
  useDeleteCartMutation,
  useFinalizeCartMutation,
  useOpenCartMutation,
  useRemoveFromCartMutation,
} from "./cart.graphql";

export function useCartService() {
  return {
    /** Opens a new cart or returns the currently opened cart if one exists for the given user */
    useOpenCartMutation,
    useDeleteCartMutation,
    useAddToCartMutation,
    useRemoveFromCartMutation,
    useFinalizeCartMutation,
  };
}
