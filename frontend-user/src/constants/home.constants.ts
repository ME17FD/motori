/**
 * Static copy and media used on the marketing home page (hero, about, footer links, slider timing).
 */
export const HERO_IMAGES = ["/assets/a.png", "/assets/hero2.jpg", "/assets/hero3.jpg"];

export const ABOUT_DESCRIPTION =
  "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

export const FOOTER_LINKS = {
  produits: [
    { label: "Casques", href: "/casques" },
    { label: "Equipements", href: "/equipements" },
    { label: "Consomables", href: "/consomables" },
    { label: "Divers", href: "/divers" },
  ],
  liensUtiles: [
    { label: "Contactez-nous", href: "/contact" },
    { label: "Condition générale de vente", href: "/cgv" },
    { label: "Mentions légales", href: "/mentions" },
    { label: "Conditions de retour & Garantie", href: "/retour" },
  ],
} as const;

/** Autoplay interval for hero and product sliders on the home page (milliseconds). */
export const AUTOPLAY_DELAY_MS = 5000;
