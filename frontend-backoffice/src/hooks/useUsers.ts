/**
 * useUsers — TanStack Query hooks for user management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchUsers,
  fetchUserById,
  setUserEnabled,
} from '../services/userService';
import type { UserFilters } from '../types/user';

// ─── Query keys ────────────────────────────────────────────────────────────

export const userKeys = {
  all:     ['users'] as const,
  lists:   () => [...userKeys.all, 'list'] as const,
  list:    (f: UserFilters) => [...userKeys.lists(), f] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail:  (id: number) => [...userKeys.details(), id] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────────────────

/** Paginated user list */
export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn:  () => fetchUsers(filters),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

/** Single user by ID */
export function useUser(id: number | null) {
  return useQuery({
    queryKey: userKeys.detail(id ?? 0),
    queryFn:  () => fetchUserById(id!),
    enabled:  id !== null,
    staleTime: 2 * 60 * 1000,
  });
}

/** Enable / disable user account */
export function useSetUserEnabled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      setUserEnabled(id, enabled),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.setQueryData(userKeys.detail(user.id), user);
      toast.success(
        `User ${user.enabled ? 'enabled' : 'disabled'} successfully.`
      );
    },
    onError: () => toast.error('Failed to update user status.'),
  });
}