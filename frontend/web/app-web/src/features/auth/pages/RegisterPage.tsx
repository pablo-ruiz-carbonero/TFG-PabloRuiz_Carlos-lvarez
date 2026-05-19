// src/features/auth/pages/RegisterPage.tsx

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import bg from "../../../assets/bg-login-and-register.webp";
import "../styles/login.styles.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // FIX: usamos AuthContext.register que guarda el token automáticamente
      //    y navega al dashboard sin pasar por /login de nuevo
      await register(nombre, email, password, telefono || undefined);
      navigate("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Error al registrarse";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mainBox" style={{ backgroundImage: `url(${bg})` }}>
      <div className="authBox">
        <h1 className="title">Bienvenido 🌿</h1>
        <p className="subtitle">Crea una cuenta en AgroLink</p>

        <form className="form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Teléfono (opcional)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        {error && <p className="errorMessage">{error}</p>}

        <p className="footerText">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="registerRoute">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
