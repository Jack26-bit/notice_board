import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "./api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("student_token");
      if (token) {
        try {
          const me = await getMe();
          setUser(me);
        } catch (e) {
          localStorage.removeItem("student_token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();

    const handleUnauthorized = () => setUser(null);
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("student_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("student_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
