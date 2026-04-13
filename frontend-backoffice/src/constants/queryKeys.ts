/**
 * TanStack Query cache key factory.
 * All keys are strongly typed using const assertions.
 * Factory functions ensure consistent key shapes for targeted invalidation.
 */
export const QUERY_KEYS = {
  // Auth
  me: () => ['me'] as const,

  // Statistics — backoffice-service
  todaySummary:  () => ['statistics', 'today'] as const,
  dashboard:     (params: Record<string, unknown>) => ['statistics', 'dashboard', params] as const,
  topProducts:   (days: number, limit: number) => ['statistics', 'top-products', days, limit] as const,

  // Orders — backoffice-service
  orders:         (params: Record<string, unknown>) => ['orders', params] as const,
  order:          (id: string) => ['orders', id] as const,
  ordersByUser:   (userId: string, params: Record<string, unknown>) => ['orders', 'user', userId, params] as const,
  ordersByStatus: (status: string, params: Record<string, unknown>) => ['orders', 'status', status, params] as const,
  ordersRecent:   (limit: number) => ['orders', 'recent', limit] as const,
  ordersSearch:   (filters: Record<string, unknown>) => ['orders', 'search', filters] as const,

  // Part brands — product-service
  partBrands: (params: Record<string, unknown>) => ['part-brands', params] as const,
  partBrand:  (id: string) => ['part-brands', id] as const,

  // Equipment brands — product-service
  equipementBrands: (params: Record<string, unknown>) => ['equipement-brands', params] as const,
  equipementBrand:  (id: string) => ['equipement-brands', id] as const,

  // Part categories — product-service
  partCategories: (params: Record<string, unknown>) => ['part-categories', params] as const,
  partCategory:   (id: string) => ['part-categories', id] as const,

  // Equipment categories — product-service
  equipementCategories: (params: Record<string, unknown>) => ['equipement-categories', params] as const,
  equipementCategory:   (id: string) => ['equipement-categories', id] as const,

  // Vehicules — product-service
  vehicules:      (params: Record<string, unknown>) => ['vehicules', params] as const,
  vehicule:       (id: string) => ['vehicules', id] as const,
  vehiculeBrands: (params: Record<string, unknown>) => ['vehicule-brands', params] as const,
  vehiculeBrand:  (id: string) => ['vehicule-brands', id] as const,

  // Parts — product-service
  parts: (params: Record<string, unknown>) => ['parts', params] as const,
  part:  (id: string) => ['parts', id] as const,

  // Equipements — product-service
  equipements: (params: Record<string, unknown>) => ['equipements', params] as const,
  equipement:  (id: string) => ['equipements', id] as const,

  // Inventory — product-service
  inventory:     (params: Record<string, unknown>) => ['inventory', params] as const,
  inventoryItem: (id: string) => ['inventory', id] as const,

  // Payments — payment-service
  payments:        (params: Record<string, unknown>) => ['payments', params] as const,
  payment:         (id: string) => ['payments', id] as const,
  paymentsByOrder: (orderId: string) => ['payments', 'order', orderId] as const,
  pendingPayments: () => ['payments', 'pending'] as const,

  // Users — user-service
  users:     (params: Record<string, unknown>) => ['users', params] as const,
  user:      (id: string) => ['users', id] as const,
  userStats: (id: string) => ['users', id, 'stats'] as const,

  // Promotions
  promotions: (params: Record<string, unknown>) => ['promotions', params] as const,
  promotion:  (id: string) => ['promotions', id] as const,
} as const;