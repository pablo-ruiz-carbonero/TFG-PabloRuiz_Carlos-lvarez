// src/features/products/hooks/useProducts.ts

import { useContext } from "react";
import { ProductsContext } from "../context/ProductsContext";

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts debe usarse dentro de ProductsProvider");
  return ctx;
};