import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { loginStudent, registerStudent } from "../api";

export default function AuthForm({ isRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        const data = await registerStudent({ name, email, password });
        login(data.user, data.access_token);
      } else {
        const data = await loginStudent({ email, password });
        login(data.user, data.access_token);
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>{isRegister ? "Student Registration" : "Student Login"}</h2>
        <p>{isRegister ? "Create a new student account." : "Sign in to view notices."}</p>

        {isRegister && (
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: ".5rem" }}>
          {loading ? "Please wait…" : isRegister ? "Sign Up" : "Sign In"}
        </button>

        <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.85rem" }}>
          {isRegister ? "Already have an account? " : "Need an account? "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Log in here" : "Register here"}
          </Link>
        </p>
      </form>
    </div>
  );
}
