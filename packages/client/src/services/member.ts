import { Role } from "@prisma/client";
import { useRetailLocationService } from "src/services/retail-location";
import {
  MemberFragmentDoc,
  useGetMembersQuery,
  useRemoveMemberMutation,
  useUpdateRoleMutation,
} from "src/services/user.graphql";

export function useMembersService() {
  const { selectedLocation } = useRetailLocationService();

  const { members, loading } = useGetMembersQuery(
    () => ({
      retailLocationId: selectedLocation.value?.id ?? "",
    }),
    {
      enabled: !!selectedLocation.value?.id,
    },
  );

  const { updateRole: _updateRole } = useUpdateRoleMutation();
  async function updateRole(userId: string, role: Role) {
    if (!selectedLocation.value?.id) {
      return;
    }

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
        fragment: MemberFragmentDoc,
        fragmentName: "Member",
        variables: {
          retailLocationId: selectedLocation.value.id,
        },
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

  const { removeMember: deleteUser } = useRemoveMemberMutation();
  async function removeUser(id: string) {
    if (!selectedLocation.value?.id) {
      return;
    }

    const { cache } = await deleteUser({
      input: {
        id,
        retailLocationId: selectedLocation.value.id,
      },
    });

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
