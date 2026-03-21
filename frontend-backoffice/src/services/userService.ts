import axiosInstance from '../api/axiosInstance';
import type { User, UserFilters, UpdateUserRequest } from '../types/user';
import type { PageResponse } from '../types/api';

const BASE = '/api/users';

export interface UserStats {
  userId: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
}

/**
 * GET /api/users — paginated + filtered list.
 */
export async function fetchUsers(
  params: UserFilters = {},
): Promise<PageResponse<User>> {
  const { data } = await axiosInstance.get<PageResponse<User>>(BASE, { params });
  return data;
}

/**
 * GET /api/users/:id
 */
export async function fetchUser(id: string): Promise<User> {
  const { data } = await axiosInstance.get<User>(`${BASE}/${id}`);
  return data;
}

/**
 * PATCH /api/users/:id
 */
export async function updateUser(
  id: string,
  payload: UpdateUserRequest,
): Promise<User> {
  const { data } = await axiosInstance.patch<User>(`${BASE}/${id}`, payload);
  return data;
}

/**
 * GET /api/users/:id/stats
 */
export async function fetchUserStats(id: string): Promise<UserStats> {
  const { data } = await axiosInstance.get<UserStats>(`${BASE}/${id}/stats`);
  return data;
}