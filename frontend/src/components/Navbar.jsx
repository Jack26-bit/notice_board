import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Navbar({ theme, onToggleTheme }) {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";
  const { user, logout } = useAuth();

  const handleTvMode = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="logo-icon">📋</span>
        Notice Board
      </Link>

      <div className="navbar-actions">
        {!isAdmin && (
          <button className="btn btn-sm" onClick={handleTvMode} title="TV Mode">
            🖥️ TV
          </button>
        )}

        <button className="btn-icon" onClick={onToggleTheme} title="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {!isAdmin && user && (
          <>
            <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Hi, {user.name.split(" ")[0]}
            </span>
            <button className="btn btn-sm" onClick={logout}>Logout</button>
          </>
        )}

        {!isAdmin && !user && (
          <>
            <Link to="/login" className="btn btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}

        {isAdmin ? (
          <Link to="/" className="btn btn-sm">← Feed</Link>
        ) : (
          <Link to="/admin" className="btn btn-sm">Admin</Link>
        )}
      </div>
    </nav>
  );
}

