import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>RoastMyIdea</Link>
      </div>

      <div className="navbar-center">
        <NavLink to="/" end className="navbar-link navbar-desktop-only">Browse</NavLink>
        {user && (
          <NavLink to="/pitch" className="navbar-link navbar-desktop-only">Pitch</NavLink>
        )}
      </div>

      <div className="navbar-right">
        {user && <span className="navbar-rc">💰 {user.roastCoinBalance} RC</span>}
        {user && (
          <Link to={`/users/${user.id}`} className="navbar-link navbar-desktop-only">
            {user.displayName}
          </Link>
        )}
        {user && (
          <button className="navbar-btn-secondary navbar-desktop-only" onClick={handleLogout}>
            Log Out
          </button>
        )}
        {!user && (
          <Link to="/auth" className="navbar-btn navbar-desktop-only">Log In</Link>
        )}
        <button
          className="navbar-hamburger navbar-mobile-only"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-icon ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-dropdown">
          <NavLink to="/" end className="dropdown-link" onClick={closeMenu}>Browse</NavLink>
          {user && <NavLink to="/pitch" className="dropdown-link" onClick={closeMenu}>Pitch</NavLink>}
          {user && (
            <Link to={`/users/${user.id}`} className="dropdown-link" onClick={closeMenu}>
              {user.displayName}
            </Link>
          )}
          {!user && <Link to="/auth" className="dropdown-link" onClick={closeMenu}>Log In</Link>}
          {user && (
            <button className="dropdown-link dropdown-logout" onClick={handleLogout}>
              Log Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
