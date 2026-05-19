// src/features/auth/pages/LoginPage.tsx

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import bg from "../../../assets/bg-login-and-register.webp";
import "../styles/login.styles.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // FIX: usamos el AuthContext que guarda el token correctamente
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      // Axios envuelve el error: err.response.data.message viene del backend NestJS
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Error al iniciar sesión";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mainBox" style={{ backgroundImage: `url(${bg})` }}>
      <div className="authBox">
        <h1 className="title">Bienvenido 🌿</h1>
        <p className="subtitle">Inicia sesión en AgroLink</p>

        <form className="form" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {error && <p className="errorMessage">{error}</p>}

        <p className="footerText">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="registerRoute">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
