import { apiFetch } from "./apiClient";
import type { User, UserCreatePayload, UserUpdatePayload } from "../types/user";

const BASE = "/api/users";

export const userApi = {
  getAll: (): Promise<User[]> =>
    apiFetch<User[]>(BASE),

  getById: (id: number): Promise<User> =>
    apiFetch<User>(`${BASE}/${id}`),

  create: (payload: UserCreatePayload): Promise<User> =>
    apiFetch<User>(BASE, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: UserUpdatePayload): Promise<User> =>
    apiFetch<User>(`${BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  delete: (id: number): Promise<null> =>
    apiFetch<null>(`${BASE}/${id}`, {
      method: "DELETE",
    }),
};