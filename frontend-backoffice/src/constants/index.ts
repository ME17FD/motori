/**
 * Frontend Constants Export
 * Exports reusable UI components and application constants.
 * Component exports provide central import points for components shared across pages.
 * Content constants define UI text, assets, and configuration.
 */

export { default as Button        } from "../components/Button/Button";
export { default as Navbar        } from "../components/Navbar/Navbar";
export { default as ProductCard   } from "../components/ProductCard/ProductCard";
export { default as ProductSlider } from "../components/ProductSlider/ProductSlider";

/**
 * Hero section carousel images
 */
export const HERO_IMAGES = [
  "/assets/a.png",
  "/assets/hero2.jpg",
  "/assets/hero3.jpg"
];

export const ABOUT_DESCRIPTION = "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

export const FOOTER_LINKS = {
  produits: [
    { label: "Casques",      href: "/casques"      },
    { label: "Equipements",  href: "/equipements"  },
    { label: "Consomables",  href: "/consomables"  },
    { label: "Divers",       href: "/divers"       },
  ],
  liensUtiles: [
    { label: "Contactez-nous",                href: "/contact"  },
    { label: "Condition générale de vente",   href: "/cgv"      },
    { label: "Mentions légales",              href: "/mentions" },
    { label: "Conditions de retour & Garantie", href: "/retour" },
  ],
};
export const AUTOPLAY_DELAY_MS = 5000;