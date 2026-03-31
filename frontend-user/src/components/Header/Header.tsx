import React from "react";
import "./Header.css";
import type { HeaderProps } from "../../types/ui/Header.types";

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