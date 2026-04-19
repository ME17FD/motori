/**
 * Navbar Component Type Definitions
 * Props interfaces for Navbar and its CategoryItem sub-component.
 */

import type { NavCategory } from "../../types";

/**
 * Navbar component props.
 * @param categories - Hierarchical category tree
 * @param onSearchSubmit - Callback fired when user submits search
 */
export interface NavbarProps {
  categories: NavCategory[];
  onSearchSubmit?: (query: string) => void;
}


export interface CategoryItemProps {
  category: NavCategory;
  depth?: number;
}
