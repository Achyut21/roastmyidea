import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Coins } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className={`navbar-inner${user ? '' : ' no-center'}`}>
          <div className="navbar-left">
            <Link to="/" className="navbar-logo" onClick={closeMenu}>
              <img src="/logo.webp" alt="RoastMyIdea logo" className="navbar-logo-img" />
              RoastMyIdea
            </Link>
          </div>

          {user && (
            <nav className="navbar-center">
              <NavLink to="/" end className="navbar-link">
                Browse
              </NavLink>
              <NavLink to="/pitch" className="navbar-link">
                Pitch
              </NavLink>
              <NavLink to={`/users/${user.id}`} className="navbar-link">
                Profile
              </NavLink>
            </nav>
          )}

          <div className="navbar-right">
            {user && (
              <span className="navbar-rc">
                <Coins size={14} aria-hidden="true" />
                {user.roastCoinBalance} RC
              </span>
            )}
            {user && (
              <button
                className="navbar-btn-secondary navbar-desktop-only"
                onClick={handleLogout}
              >
                Log Out
              </button>
            )}
            {!user && (
              <Link to="/auth" className="navbar-btn navbar-desktop-only">
                Log In
              </Link>
            )}
            <button
              ref={hamburgerRef}
              className="navbar-hamburger navbar-mobile-only"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger-icon ${menuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <div className="mobile-backdrop" onClick={closeMenu} />}

      {menuOpen && (
        <div ref={menuRef} className="mobile-menu">
          {user && (
            <div className="mobile-rc">
              <Coins size={14} aria-hidden="true" />
              {user.roastCoinBalance} RC
            </div>
          )}
          <NavLink to="/" end className="mobile-link" onClick={closeMenu}>
            Browse
          </NavLink>
          {user && (
            <NavLink to="/pitch" className="mobile-link" onClick={closeMenu}>
              Pitch
            </NavLink>
          )}
          {user && (
            <NavLink to={`/users/${user.id}`} className="mobile-link" onClick={closeMenu}>
              Profile
            </NavLink>
          )}
          {!user && (
            <Link to="/auth" className="mobile-link" onClick={closeMenu}>
              Log In
            </Link>
          )}
          {user && (
            <button className="mobile-link mobile-logout" onClick={handleLogout}>
              Log Out
            </button>
          )}
        </div>
      )}
    </>
  );
}
