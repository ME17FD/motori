/**
 * Central route definitions for the backoffice application.
 * All navigation and <Link> components must reference these constants.
 */
export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',

  HOME:      '/',

  // Products
  PARTS:      '/products/parts',
  PARTDETAILS: '/products/parts/:id',
  EQUIPMENT:  '/products/equipment',
  EQUIPDETAILS: '/products/equipment/:id',

  //Cart
  CART:       '/cart',

  //checkout
  CHECKOUT:   '/checkout',

  // User
  PROFILE:      '/profile',
  
  // Orders
  ORDERS:          '/orders',
  ORDER_DETAIL:    '/orders/:id',


} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];