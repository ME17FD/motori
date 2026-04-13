/**
 * User types — mirrors user-service schemas.
 */

export type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN';

export interface UserDto {
  id: number;
  /** Keycloak UUID */
  keycloakId?: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  roles: UserRole[];
  enabled: boolean;
  createdAt: string;
  /** Total amount spent across all orders */
  totalSpent?: number;
  /** Total number of orders placed */
  orderCount?: number;
}

export interface UserFilters {
  email?: string;
  name?: string;
  page?: number;
  size?: number;
}