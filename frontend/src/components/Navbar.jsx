/**
 * Navbar — App header with brand, dark mode toggle, TV mode, admin link.
 */

import { Link, useLocation } from "react-router-dom";

export default function Navbar({ theme, onToggleTheme }) {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";

  const handleTvMode = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      document.body.classList.remove("tv-mode");
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
      document.body.classList.add("tv-mode");
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

        {isAdmin ? (
          <Link to="/" className="btn btn-sm">← Feed</Link>
        ) : (
          <Link to="/admin" className="btn btn-sm">Admin</Link>
        )}
      </div>
    </nav>
  );
}
