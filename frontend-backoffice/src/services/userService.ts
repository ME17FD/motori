/**
 * User service — user management via user-service.
 * Base path: /api/users (through API Gateway)
 */

import apiClient from '../api/axiosInstance';
import type { UserDto, UserFilters } from '../types/user';
import type { PageResult } from '../types/product';

/** Fetch paginated users */
export async function fetchUsers(
  filters: UserFilters = {}
): Promise<PageResult<UserDto>> {
  const { data } = await apiClient.get<PageResult<UserDto>>('/api/users', {
    params: {
      email: filters.email,
      name:  filters.name,
      page:  filters.page ?? 0,
      size:  filters.size ?? 20,
    },
  });
  return data;
}

/** Fetch a single user by ID */
export async function fetchUserById(id: number): Promise<UserDto> {
  const { data } = await apiClient.get<UserDto>(`/api/users/${id}`);
  return data;
}

/** Enable or disable a user account */
export async function setUserEnabled(
  id: number,
  enabled: boolean
): Promise<UserDto> {
  const { data } = await apiClient.patch<UserDto>(
    `/api/users/${id}/status`,
    { enabled }
  );
  return data;
}