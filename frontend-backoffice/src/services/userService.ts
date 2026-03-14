import axiosInstance from '../api/axiosInstance';
import type { User, UserFilters, UpdateUserRequest } from '../types/user';
import type { PageResponse } from '../types/api';

const BASE = '/api/users';

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
export async function fetchUser(id: number): Promise<User> {
  const { data } = await axiosInstance.get<User>(`${BASE}/${id}`);
  return data;
}

/**
 * PATCH /api/users/:id
 * Updates enabled status or roles.
 */
export async function updateUser(
  id: number,
  payload: UpdateUserRequest,
): Promise<User> {
  const { data } = await axiosInstance.patch<User>(`${BASE}/${id}`, payload);
  return data;
}

/**
 * GET /api/users/:id/stats
 * Returns order count and total spend for a user.
 */
export async function fetchUserStats(id: number): Promise<UserStats> {
  const { data } = await axiosInstance.get<UserStats>(`${BASE}/${id}/stats`);
  return data;
}

export interface UserStats {
  userId: number;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
}