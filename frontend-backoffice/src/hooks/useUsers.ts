/**
 * Users Hook
 * Provides TanStack Query hooks for user management queries and mutations.
 * Handles paginated user list, single user detail, user statistics, and role updates.
 */

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
 * Single user by id.
 */
export function useUser(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: () => fetchUser(id),
    enabled: id > 0,
  });
}

/**
 * Order count and total spend for a user.
 */
export function useUserStats(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.userStats(id),
    queryFn: () => fetchUserStats(id),
    enabled: id > 0,
  });
}

/**
 * Update user enabled status or roles.
 */
export function useUserMutations() {
  const qc = useQueryClient();

  const invalidate = (id?: number) => {
    qc.invalidateQueries({ queryKey: ['users'] });
    if (id) qc.invalidateQueries({ queryKey: QUERY_KEYS.user(id) });
  };

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserRequest }) =>
      updateUser(id, payload),
    onSuccess: (_, { id }) => invalidate(id),
  });

  return { update };
}