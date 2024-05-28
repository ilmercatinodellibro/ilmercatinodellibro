import { Role } from "@prisma/client";
import { evictQuery } from "src/apollo/cache";
import { useRetailLocationService } from "src/services/retail-location";
import {
  GetMembersDocument,
  MemberFragmentDoc,
  useGetMembersQuery,
  useRemoveMemberMutation,
  useUpdateRoleMutation,
} from "src/services/user.graphql";

export function useMembersService() {
  const { selectedLocation } = useRetailLocationService();

  const {
    members,
    loading,
    refetch: refetchMembers,
  } = useGetMembersQuery(() => ({
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

  const { removeMember: _removeMember } = useRemoveMemberMutation();
  async function removeMember(id: string) {
    const { cache } = await _removeMember({
      input: {
        id,
        retailLocationId: selectedLocation.value.id,
      },
    });

    const cacheId = cache.identify({ id, __typename: "User" });
    cache.evict({ id: cacheId });
    evictQuery(cache, GetMembersDocument);
    cache.gc();
  }

  return {
    members,
    loading,
    removeMember,
    updateRole,
    refetchMembers,
  };
}
