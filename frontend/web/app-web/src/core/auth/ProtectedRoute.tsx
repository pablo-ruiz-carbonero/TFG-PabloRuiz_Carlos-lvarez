// src/core/auth/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  // Mientras se restaura la sesión no redirigimos todavía
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
