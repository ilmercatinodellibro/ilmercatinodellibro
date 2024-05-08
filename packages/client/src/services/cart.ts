import {
  useAddToCartMutation,
  useDeleteCartMutation,
  useFinalizeCartMutation,
  useOpenCartMutation,
  useRemoveFromCartMutation,
} from "./cart.graphql";

const CART_EXPIRY_IN_SECONDS = 30 * 60;

export function useCartService() {
  return {
    CART_EXPIRY_IN_SECONDS,
    /** Opens a new cart or returns the currently opened cart if one exists for the given user */
    useOpenCartMutation,
    useDeleteCartMutation,
    useAddToCartMutation,
    useRemoveFromCartMutation,
    useFinalizeCartMutation,
  };
}
