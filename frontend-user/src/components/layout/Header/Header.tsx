import React from "react";
import "../../../styles/components/Header.css";
import type { HeaderProps } from "../../../types/ui/Header.types";

/**
 * Decorative page title block for catalog-style pages (eyebrow, title, optional count).
 *
 * @param props.eyebrow - Small uppercase label above the title
 * @param props.title - Main heading
 * @param props.count - Optional number of items (renders “N articles”)
 */
const Header: React.FC<HeaderProps> = ({ eyebrow, title, count }) => {
  return (
    <header className="header">
      <div className="headerInner">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="title">{title}</h1>
        {count !== undefined && (
          <p className="count">
            <span className="countNum">{count}</span> articles
          </p>
        )}
      </div>
      <div className="headerSlash" aria-hidden="true" />
    </header>
  );
};

export default Header;
