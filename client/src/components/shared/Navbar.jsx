import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          RoastMyIdea
        </Link>
        <NavLink to="/" end className="navbar-link">
          Browse
        </NavLink>
        {user && (
          <NavLink to="/pitch" className="navbar-link">
            Pitch
          </NavLink>
        )}
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <span className="navbar-rc">💰 {user.roastCoinBalance} RC</span>
            <Link to={`/users/${user.id}`} className="navbar-link">
              {user.displayName}
            </Link>
            <button className="navbar-btn-secondary" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <Link to="/auth" className="navbar-btn">
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}
