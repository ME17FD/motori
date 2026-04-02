/**
 * Barrel for app-wide constants (routes, cart keys, home page static data).
 * UI components are imported from their modules under `components/`, not from here.
 */
export {
  HERO_IMAGES,
  ABOUT_DESCRIPTION,
  FOOTER_LINKS,
  AUTOPLAY_DELAY_MS,
} from "./home.constants";
export { ROUTES } from "./routes";
export { CART_CONSTANTS, CART_STORAGE_KEY } from "./cart.constants";
