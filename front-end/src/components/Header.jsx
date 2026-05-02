import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';
import './Header.css';
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Ana Sayfa' },
    { path: '/club-info', label: 'Kulüp Bilgi' },
    { path: '/contact', label: 'İletişim' },
  ];

  return (
    <header className="header">
      <div className="container header-container">
        {/* LOGO */}
        <Link to="/" className="logo">
          <div className="logo-icon">
            <span>T</span>
          </div>
          <h1 className="logo-text">BozTech </h1>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="nav-desktop">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ACTIONS */}
        <div className="header-actions">
          <Link to="/apply" className="btn btn-primary">
            <FiUser /> Başvuru Yap
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mobile-actions">
                <Link to="/apply" className="btn btn-primary btn-block">
                  <FiUser /> Başvuru Yap
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;