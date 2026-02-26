import React, { useState } from "react";
import "../../styles/Navbar/Navbar.css";
import { FaBars, FaMotorcycle, FaShoppingCart, FaUser } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import logo from "../../assets/logo.png";

const Navbar: React.FC = () => {
  const [search, setSearch] = useState("");

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-icon"><FaBars /></span>
        <img src={logo} alt="Logo" className="navbar-logo" />
      </div>

      <div className="navbar-search">
        <input
          type="text"
          placeholder="..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="search-icon"><FiSearch /></span>
      </div>

      <div className="navbar-right">
        <span className="navbar-icon"><FaMotorcycle /></span>
        <span className="navbar-icon"><FaShoppingCart /></span>
        <span className="navbar-icon"><FaUser /></span>
      </div>
    </nav>
  );
};

export default Navbar;