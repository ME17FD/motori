import { userApi } from "../api/userApi";
import type { User, UserCreatePayload, UserUpdatePayload } from "../types/userType";

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    return await userApi.getAll();
  },

  getUserById: async (id: number): Promise<User> => {
    return await userApi.getById(id);
  },

  createUser: async (payload: UserCreatePayload): Promise<User> => {
    if (!payload.firstname || !payload.lastname) {
      throw new Error("First name and last name are required.");
    }
    if (!payload.email || !payload.email.includes("@")) {
      throw new Error("A valid email is required.");
    }
    return await userApi.create(payload);
  },

  updateUser: async (id: number, payload: UserUpdatePayload): Promise<User> => {
    if (!payload.firstname || !payload.lastname) {
      throw new Error("First name and last name are required.");
    }
    if (!payload.email || !payload.email.includes("@")) {
      throw new Error("A valid email is required.");
    }
    return await userApi.update(id, payload);
  },

  deleteUser: async (id: number): Promise<null> => {
    return await userApi.delete(id);
  },

  searchUsers: (users: User[], query: string): User[] => {
    const q = query.toLowerCase();
    return users.filter(u =>
      `${u.firstname} ${u.lastname} ${u.email} ${u.phone}`
        .toLowerCase()
        .includes(q)
    );
  },
};

