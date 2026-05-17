// src/features/products/hooks/useProductDetail.ts

import { useState, useCallback } from "react";
import { Product } from "../types/products.types";
import { useProducts } from "./useProducts";

export const useProductDetail = (productId: string) => {
  const { getProductById, deleteProduct } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductById(productId);
      setProduct(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const removeProduct = async (): Promise<void> => {
    await deleteProduct(productId);
  };

  return { product, loading, error, loadProduct, removeProduct };
};
