import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUsers,
  fetchUser,
  fetchUserStats,
  updateUser,
} from '../services/userService';
import { QUERY_KEYS } from '../constants/queryKeys';
import type { UserFilters, UpdateUserRequest } from '../types/user';

/**
 * Paginated users list with filters.
 */
export function useUsers(params: UserFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.users(params),
    queryFn: () => fetchUsers(params),
  });
}

/**
 * Single user by id — id is a string UUID.
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

/**
 * Order count and total spend for a user.
 */
export function useUserStats(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.userStats(id),
    queryFn: () => fetchUserStats(id),
    enabled: !!id,
  });
}

/**
 * Update user enabled status or roles.
 */
export function useUserMutations() {
  const qc = useQueryClient();

  const invalidate = (id?: string) => {
    qc.invalidateQueries({ queryKey: ['users'] });
    if (id) qc.invalidateQueries({ queryKey: QUERY_KEYS.user(id) });
  };

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRequest }) =>
      updateUser(id, payload),
    onSuccess: (_, { id }) => invalidate(id),
  });

  return { update };
}