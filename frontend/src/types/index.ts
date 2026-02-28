// ─────────────────────────────────────────────────────────────
//  Global shared types
// ─────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  image: string;
  title: string;
  dimensions: string;
  price: string;
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
