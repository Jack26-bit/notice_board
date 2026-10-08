import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import NoticeFeed from "./components/NoticeFeed";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";
import AuthForm from "./components/AuthForm";
import { AuthProvider, useAuth } from "./AuthContext";

function ProtectedFeed() {
  const { user, loading } = useAuth();
  if (loading) return <div className="state-container"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <NoticeFeed />;
}

function App() {
  // --- Theme ---
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // --- Admin Auth ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // --- TV Mode ---
  const [isTvMode, setIsTvMode] = useState(false);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsTvMode(isFs);
      if (!isFs) {
        document.body.classList.remove("tv-mode");
      } else {
        document.body.classList.add("tv-mode");
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.body.classList.remove("tv-mode");
    };
  }, []);

  const handleExitTv = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        
        {isTvMode && (
          <button 
            className="btn btn-danger" 
            style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 1000, boxShadow: "var(--shadow-lg)" }} 
            onClick={handleExitTv}
          >
            ❌ Exit TV Mode
          </button>
        )}

        <Routes>
          <Route path="/" element={<ProtectedFeed />} />
          <Route path="/login" element={<AuthForm isRegister={false} />} />
          <Route path="/register" element={<AuthForm isRegister={true} />} />
          <Route
            path="/admin"
            element={
              isLoggedIn
                ? <AdminPanel onLogout={handleLogout} />
                : <Login onLogin={handleLogin} />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

