/**
 * Parts Management Page
 * Wrapper component that renders ProductsPage with PART type pre-filter.
 * Specializes the generic products page for motorcycle parts inventory.
 */

import ProductsPage from './ProductsPage';

/**
 * Parts page — filters products to PART type only.
 */
export default function PartsPage() {
  return <ProductsPage productType="PART" />;
}