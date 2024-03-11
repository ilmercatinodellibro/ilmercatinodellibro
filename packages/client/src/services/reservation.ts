import {
  useCreateReservationsMutation,
  useDeleteReservationMutation,
  useGetReservationsQuery,
} from "./reservation.graphql";

export function useReservationService() {
  return {
    useGetReservationsQuery,
    useCreateReservationsMutation,
    useDeleteReservationMutation,
  };
}
