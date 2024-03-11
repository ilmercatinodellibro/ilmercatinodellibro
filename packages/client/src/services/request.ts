import {
  useCreateRequestMutation,
  useDeleteRequestMutation,
  useGetRequestsQuery,
} from "./request.graphql";

export function useRequestService() {
  return {
    useGetRequestsQuery,
    useCreateRequestMutation,
    useDeleteRequestMutation,
  };
}
