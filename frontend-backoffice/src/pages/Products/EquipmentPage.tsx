/**
 * Equipment Management Page
 * Wrapper component that renders ProductsPage with EQUIPMENT type pre-filter.
 * Specializes the generic products page for motorcycle equipment inventory.
 */

import ProductsPage from './ProductsPage';

/**
 * Equipment page — filters products to EQUIPMENT type only.
 */
export default function EquipmentPage() {
  return <ProductsPage productType="EQUIPMENT" />;
}