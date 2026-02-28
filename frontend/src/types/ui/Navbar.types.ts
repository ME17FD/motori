import type { export export export export NavCategory } from "../../types";

export interface NavbarProps {
  categories: NavCategory[];
  onSearchSubmit?: (query: string) => void;
}

export interface CategoryItemProps {
  category: NavCategory;
  depth?: number;
}
