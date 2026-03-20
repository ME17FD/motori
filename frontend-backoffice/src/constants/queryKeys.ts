/**
 * TanStack Query Key Factory
 * Centralized management of React Query cache keys.
 * Each queryFn usage should map to exactly one key creator function.
 * Format: ['domain', 'entity', ...params]
 * Used to enable automatic cache invalidation on mutations.
 * Reference: https://tanstack.com/query/latest/docs/react/query-keys
 */

export const QUERY_KEYS = {
  me: () => ['me'] as const,

  todaySummary:  () => ['statistics', 'today'] as const,
  dashboard:     (params: Record<string, unknown>) => ['statistics', 'dashboard', params] as const,
  topProducts:   (days: number, limit: number) => ['statistics', 'top-products', days, limit] as const,

  orders:         (params: Record<string, unknown>) => ['orders', params] as const,
  order:          (id: string) => ['orders', id] as const,
  ordersByUser:   (userId: number, params: Record<string, unknown>) => ['orders', 'user', userId, params] as const,
  ordersByStatus: (status: string, params: Record<string, unknown>) => ['orders', 'status', status, params] as const,
  ordersRecent:   (limit: number) => ['orders', 'recent', limit] as const,
  ordersSearch:   (filters: Record<string, unknown>) => ['orders', 'search', filters] as const,

  brands:    (params: Record<string, unknown>) => ['brands', params] as const,
  brandsAll: () => ['brands', 'all'] as const,
  brand:     (id: number) => ['brands', id] as const,

  categories:    (params: Record<string, unknown>) => ['categories', params] as const,
  categoriesAll: () => ['categories', 'all'] as const,
  category:      (id: number) => ['categories', id] as const,

  vehicles:    (params: Record<string, unknown>) => ['vehicles', params] as const,
  vehiclesAll: () => ['vehicles', 'all'] as const,
  vehicle:     (id: number) => ['vehicles', id] as const,

  products: (params: Record<string, unknown>) => ['products', params] as const,
  product:  (id: number) => ['products', id] as const,

  inventory:        (params: Record<string, unknown>) => ['inventory', params] as const,
  inventoryItem:    (id: number) => ['inventory', id] as const,
  inventoryProduct: (productId: number) => ['inventory', 'product', productId] as const,
  lowStock:         () => ['inventory', 'low-stock'] as const,

  payments:        (params: Record<string, unknown>) => ['payments', params] as const,
  payment:         (id: number) => ['payments', id] as const,
  paymentsByOrder: (orderId: string) => ['payments', 'order', orderId] as const,
  pendingPayments: () => ['payments', 'pending'] as const,

  users:     (params: Record<string, unknown>) => ['users', params] as const,
  user:      (id: number) => ['users', id] as const,
  userStats: (id: number) => ['users', id, 'stats'] as const,

  // Promotions
  promotions: (params: Record<string, unknown>) => ['promotions', params] as const,
  promotion:  (id: number) => ['promotions', id] as const,
} as const;