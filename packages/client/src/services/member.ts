import { Role } from "@prisma/client";
import { useRetailLocationService } from "src/services/retail-location";
import {
  UserFragmentDoc,
  useGetMembersQuery,
  useRemoveUserMutation,
  useUpdateRoleMutation,
} from "src/services/user.graphql";

export function useMembersService() {
  const { selectedLocation } = useRetailLocationService();

  const { members, loading } = useGetMembersQuery(() => ({
    retailLocationId: selectedLocation.value.id,
  }));

  const { updateRole: _updateRole } = useUpdateRoleMutation();
  async function updateRole(userId: string, role: Role) {
    const { cache } = await _updateRole({
      input: {
        userId,
        retailLocationId: selectedLocation.value.id,
        role,
      },
    });

    cache.updateFragment(
      {
        id: cache.identify({ id: userId, __typename: "User" }),
        fragment: UserFragmentDoc,
        fragmentName: "User",
      },
      (data) => {
        if (!data) {
          return;
        }

        return {
          ...data,
          role,
        };
      },
    );
  }

  const { removeUser: deleteUser } = useRemoveUserMutation();
  async function removeUser(id: string) {
    const { cache } = await deleteUser({ input: { id } });

    const cacheId = cache.identify({ id, __typename: "User" });
    cache.evict({ id: cacheId });
    cache.gc();
  }

  return {
    members,
    loading,
    removeUser,
    updateRole,
  };
}
