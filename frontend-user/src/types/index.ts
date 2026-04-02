// ─────────────────────────────────────────────────────────────
//  Global shared types
// ─────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  image: string;
  title: string;
  dimensions: string;
  price: string;
  /** When set, clicking the card body navigates to part detail (React Router). */
  detailHref?: string;
  /** Optional compatibility chip for the global selected vehicle (home / sliders). */
  compatibility?: {
    readonly isCompatible: boolean;
  };
}

export interface Brand {
  name: string;
  src: string;
}

export interface NavCategory {
  id: number;
  label: string;
  href: string;
  children?: NavCategory[];
}
