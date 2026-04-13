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
  
=======
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

>>>>>>> backoffice-frontend
  // Orders
  ORDERS:          '/orders',
  ORDER_DETAIL:    '/orders/:id',



} as const;


