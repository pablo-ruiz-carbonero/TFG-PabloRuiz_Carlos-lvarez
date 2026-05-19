import { Link, useNavigate } from "react-router-dom";
import "../styles/navBar.styles.css";
// ✅ FIX: importar desde core/auth, no desde app/providers
import { useAuth } from "../../../core/auth/AuthContext";

export default function NavBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <nav className="navBar">
      <div className="logoBox">
        <Link to="/">
          <h2>🌿 AgroLink</h2>
        </Link>
      </div>

      <ul className="menu">
        <li>
          <Link to="/crops">Cultivos</Link>
        </li>
        <li>
          <Link to="/marketplace">Mercado</Link>
        </li>
        <li>
          <Link to="/weather">Clima</Link>
        </li>
        <li>
          <Link to="/messages">Mensajes</Link>
        </li>
      </ul>

      <div className="authBtn">
        {user ? (
          <>
            {/* ✅ Botón perfil: navega a /profile y usa user.nombre */}
            <button className="profileBtn" onClick={() => navigate("/profile")}>
              👤 {user.nombre}
            </button>
            <button className="logoutBtn" onClick={logout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <button className="loginBtn" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>
            <button
              className="registerBtn"
              onClick={() => navigate("/register")}
            >
              Registrarse
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
