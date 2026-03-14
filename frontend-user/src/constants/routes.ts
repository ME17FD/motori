/**
 * Route definitions for the user-facing application.
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
