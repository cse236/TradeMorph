import React, { useState, useEffect, useRef } from "react";
import "../CSS/Navbar.css";
import { Zap, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";


function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ✅ Close user dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target) &&
        userButtonRef.current &&
        !userButtonRef.current.contains(e.target)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Trades", path: "/trades" },
    { label: "Analysis", path: "/tradeupload" },
    { label: "Reports", path: "/reports" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate("/dashboard")}>
          <Zap className="logo-icon" />
          <span className="logo-text">TradeMorph</span>
        </div>

        {/*  Desktop Links */}
        <div className={`navbar-links ${mobileOpen ? "active" : ""}`}>
          {navLinks.map((link, i) => (
            <span
              key={i}
              className="nav-link"
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </span>
          ))}
        </div>

        {/*  Right Side (User Menu + Mobile Toggle) */}
        <div className="navbar-right">
          <div className="user-menu">
            <button
              ref={userButtonRef}
              className="user-avatar"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <FontAwesomeIcon icon={faUser} className="user-icon" />
            </button>

            {userMenuOpen && (
              <div ref={userMenuRef} className="dropdown-menu">
                <a onClick={() => navigate("/profile")}>Profile</a>
                <a onClick={() => navigate("/billing")}>Billing</a>
                <a onClick={handleLogout}>Logout</a>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
