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

/**
 * Brand model.
 * @param name - Brand name
 * @param src - Brand logo image URL
 */
export interface Brand {
  name: string;
  src: string;
}

/**
 * Navigation category hierarchical model.
 * @param id - Category unique identifier
 * @param label - Category display name
 * @param href - Navigation link
 * @param children - Nested subcategories (optional)
 */
export interface NavCategory {
  id: number;
  label: string;
  href: string;
  children?: NavCategory[];
}
