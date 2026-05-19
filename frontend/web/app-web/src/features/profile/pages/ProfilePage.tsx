import NavBar from "../../shared/components/NavBar";
import { useAuth } from "../../../core/auth/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <>
      <NavBar />
      <div style={{ padding: "2rem" }}>
        <h2>👤 Mi Perfil</h2>
        {user && (
          <div>
            <p>
              <strong>Nombre:</strong> {user.nombre}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            {user.telefono && (
              <p>
                <strong>Teléfono:</strong> {user.telefono}
              </p>
            )}
            {user.rol && (
              <p>
                <strong>Rol:</strong> {user.rol}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
