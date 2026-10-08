/**
 * App.jsx — Root component with routing, theme management, and auth state.
 */

import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import NoticeFeed from "./components/NoticeFeed";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";

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

  // --- Auth ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // Clean up TV mode on unmount / route change
  useEffect(() => {
    return () => document.body.classList.remove("tv-mode");
  }, []);

  return (
    <BrowserRouter>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<NoticeFeed />} />
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
  );
}

export default App;
