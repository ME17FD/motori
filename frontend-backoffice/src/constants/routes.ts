/**
 * Central route definitions for the backoffice application.
 * All navigation and <Link> components must reference these constants.
 */
export const ROUTES = {
  LOGIN: '/login',

  DASHBOARD: '/dashboard',

  // Catalog
  BRANDS:     '/catalog/brands',
  CATEGORIES: '/catalog/categories',
  VEHICLES:   '/catalog/vehicles',

  // Products
  PARTS:      '/products/parts',
  EQUIPMENT:  '/products/equipment',

  // Inventory
  INVENTORY:  '/inventory',

  // Orders
  ORDERS:          '/orders',
  ORDER_DETAIL:    '/orders/:id',

  // Payments
  PAYMENTS: '/payments',

  // Users
  USERS:       '/users',
  USER_DETAIL: '/users/:id',

  // Promotions
  PROMOTIONS: '/promotions',

  // Reports
  REPORTS: '/reports',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];