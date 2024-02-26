import { Role } from "@prisma/client";
import {
  UsersDocument,
  useRemoveUserMutation,
  useUpdateRoleMutation,
  useUsersQuery,
} from "src/services/user.graphql";

export const useUserService = () => {
  const { users, loading } = useUsersQuery();

  const { updateRole: _updateRole } = useUpdateRoleMutation();
  async function updateRole(id: string, role: Role) {
    const { cache } = await _updateRole({ input: { id, role } });

    cache.updateQuery({ query: UsersDocument }, (data) => {
      const users = data?.users;
      if (!users) {
        return;
      }
      const updatedUsers = users.map((user) =>
        user.id === id ? { ...user, role } : user,
      );
      return {
        users: updatedUsers,
      };
    });
  }

  const { removeUser: deleteUser } = useRemoveUserMutation();
  async function removeUser(id: string) {
    const { cache } = await deleteUser({ input: { id } });

    cache.updateQuery({ query: UsersDocument }, (data) => {
      const users = data?.users;
      if (!users) {
        return;
      }

      return {
        users: users.filter((user) => user.id !== id),
      };
    });
  }

  return {
    users,
    loading,
    removeUser,
    updateRole,
  };
};
