// src/features/auth/hooks/useAuthForm.ts

import { useState } from "react";

interface UseAuthFormReturn {
  loading: boolean;
  error: string | null;
  execute: (callback: () => Promise<void>) => Promise<void>;
  clearError: () => void;
}

export const useAuthForm = (): UseAuthFormReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (callback: () => Promise<void>) => {
    try {
      setError(null);
      setLoading(true);
      await callback();
    } catch (err: unknown) {
      // ✅ El error ya no se traga — se expone para que la pantalla lo muestre
      const message =
        err instanceof Error ? err.message : "Ha ocurrido un error inesperado";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { loading, error, execute, clearError };
};