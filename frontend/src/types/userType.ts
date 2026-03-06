export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  adress: string;
  approved: boolean;
  activated: boolean;
  createdAt: string;
}

export type UserFormData = Omit<User, "id" | "createdAt">;

export type UserCreatePayload = UserFormData;

export type UserUpdatePayload = UserFormData;