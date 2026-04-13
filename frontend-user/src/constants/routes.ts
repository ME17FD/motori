/**
<<<<<<< HEAD
=======
<<<<<<< HEAD:frontend/src/constants/routes.ts
>>>>>>> backoffice-frontend
 * Central route definitions for the backoffice application.
 * All navigation and <Link> components must reference these constants.
 */
export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',

<<<<<<< HEAD
  HOME:      '/',
  // Catalog
  BRANDS:     '/catalog/brands',
  CATEGORIES: '/catalog/categories',
  VEHICLES:   '/catalog/vehicles',

  // Products
  PARTS:      '/products/parts',
  PARTDETAILS: '/products/parts/:id',
  EQUIPMENT:  '/products/equipment',

  //Cart
  CART:       '/cart',

  //checkout
  CHECKOUT:   '/checkout',

  // Compatibility
  COMPATIBILITY: '/compatibility',

  // Orders
  ORDERS:          '/orders',
  ORDER_DETAIL:    '/orders/:id',

<<<<<<< HEAD

} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
=======
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

>>>>>>> backoffice-frontend
