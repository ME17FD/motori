import { userApi } from '../api/userApi';
import type { UserCreatePayload } from '../types/user';

export const userService = {
  createUser: (payload: UserCreatePayload) => userApi.create(payload),
};
