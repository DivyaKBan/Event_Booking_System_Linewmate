import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          Eventify
        </Link>

        {isAuthenticated ? (
          <div className="nav-user">
            <nav className="nav-links">
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                Events
              </NavLink>
              <NavLink to="/my-bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
                My Bookings
              </NavLink>
            </nav>
            <span>Hi, {user.name.split(' ')[0]}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <div className="nav-user">
            <Link to="/login" className="btn btn-secondary">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
