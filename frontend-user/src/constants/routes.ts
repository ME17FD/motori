export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',

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

  // User
  PROFILE:      '/profile',
  
  // Compatibility
  COMPATIBILITY: '/compatibility',



} as const;


