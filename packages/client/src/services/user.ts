import { Role } from "@prisma/client";
import { computed } from "vue";
import {
  UserFragmentDoc,
  useGetUsersQuery,
  useRemoveUserMutation,
  useUpdateRoleMutation,
} from "src/services/user.graphql";

export function useUserService() {
  const { users: usersData, loading } = useGetUsersQuery(() => ({
    // pagination for operators/admins should not be needed, so we can hardcode the values and don't need refetch
    page: 1,
    rowsPerPage: 200,
  }));

  const { updateRole: _updateRole } = useUpdateRoleMutation();
  async function updateRole(id: string, role: Role) {
    const { cache } = await _updateRole({ input: { id, role } });

    cache.updateFragment(
      {
        id: cache.identify({ id, __typename: "User" }),
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

  const users = computed(() => usersData.value?.rows ?? []);
  const rowsCount = computed(() => usersData.value?.rowsCount ?? 0);

  return {
    users,
    rowsCount,
    loading,
    removeUser,
    updateRole,
  };
}
