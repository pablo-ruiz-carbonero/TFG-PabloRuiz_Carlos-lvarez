import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./core/api/interceptors";

import App from "./App.tsx";
import { AuthProvider } from "./core/auth/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
