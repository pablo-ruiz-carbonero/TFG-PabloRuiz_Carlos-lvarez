// src/features/products/context/ProductsContext.tsx

import React, { createContext, useState, useCallback } from "react";
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductCategory,
} from "../types/products.types";
import {
  getAllProductsRequest,
  getProductByIdRequest,
  getMyProductsRequest,
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
} from "../api/productsApi";

// ─────────────────────────────────────────────────────────────
// 🚧 DEV MOCK — quitar cuando el backend esté listo
// ─────────────────────────────────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Semilla tomate",
    category: "Semillas",
    price: 12.5,
    unit: "€/kg",
    stock: 50,
    description:
      "Semillas de tomate cherry de alta calidad, variedad resistente a enfermedades. Ideal para cultivo en invernadero y al aire libre. Tasa de germinación superior al 95%.",
    location: "Málaga",
    province: "Málaga",
    seller: {
      id: "s1",
      name: "AgroMar",
      initials: "AM",
      rating: 4.8,
      sales: 32,
      location: "Málaga",
    },
    images: [],
    createdAt: "2026-04-01",
  },
  {
    id: "p2",
    name: "Fertilizante N-P-K",
    category: "Fertilizantes",
    price: 8.0,
    unit: "€/kg",
    stock: 200,
    description:
      "Fertilizante granulado NPK 15-15-15 de liberación controlada. Apto para todo tipo de cultivos hortícolas y frutales. Presentación en sacos de 25kg.",
    location: "Sevilla",
    province: "Sevilla",
    seller: {
      id: "s2",
      name: "CampoVerde",
      initials: "CV",
      rating: 4.5,
      sales: 18,
      location: "Sevilla",
    },
    images: [],
    createdAt: "2026-04-05",
  },
  {
    id: "p3",
    name: "Manguera riego",
    category: "Maquinaria",
    price: 3.2,
    unit: "€/L",
    stock: 500,
    description:
      "Manguera de polietileno de alta densidad para riego por goteo. Diámetro 16mm, resistente a rayos UV. Incluye conectores de inicio y tapones finales.",
    location: "Murcia",
    province: "Murcia",
    seller: {
      id: "s3",
      name: "HidroTec",
      initials: "HT",
      rating: 4.2,
      sales: 57,
      location: "Murcia",
    },
    images: [],
    createdAt: "2026-04-10",
  },
  {
    id: "p4",
    name: "Insecticida orgánico",
    category: "Fitosanitarios",
    price: 15.0,
    unit: "€/L",
    stock: 80,
    description:
      "Insecticida a base de extracto de neem 100% natural. Eficaz contra mosca blanca, pulgón y araña roja. Compatible con agricultura ecológica certificada.",
    location: "Granada",
    province: "Granada",
    seller: {
      id: "s4",
      name: "BioAgro",
      initials: "BA",
      rating: 4.9,
      sales: 94,
      location: "Granada",
    },
    images: [],
    createdAt: "2026-04-12",
  },
  {
    id: "p5",
    name: "Semilla pimiento rojo",
    category: "Semillas",
    price: 18.0,
    unit: "€/kg",
    stock: 30,
    description:
      "Semilla de pimiento rojo tipo California. Alto rendimiento y frutos uniformes de calibre extra. Resistente a Phytophthora capsici.",
    location: "Almería",
    province: "Almería",
    seller: {
      id: "s1",
      name: "AgroMar",
      initials: "AM",
      rating: 4.8,
      sales: 32,
      location: "Almería",
    },
    images: [],
    createdAt: "2026-04-15",
  },
  {
    id: "p6",
    name: "Sulfato de cobre",
    category: "Fitosanitarios",
    price: 6.5,
    unit: "€/kg",
    stock: 150,
    description:
      "Sulfato de cobre pentahidratado para el control de enfermedades fúngicas en vid, tomate y patata. Riqueza mínima 25% Cu.",
    location: "Huelva",
    province: "Huelva",
    seller: {
      id: "s5",
      name: "AgroHuelva",
      initials: "AH",
      rating: 4.0,
      sales: 11,
      location: "Huelva",
    },
    images: [],
    createdAt: "2026-04-18",
  },
  // 🚧 Mis productos (DEV) — seller.id === "me"
  {
    id: "p_mine_1",
    name: "Tomate rama ecológico",
    category: "Semillas",
    price: 2.5,
    unit: "€/kg",
    stock: 80,
    description:
      "Tomate de rama cultivado sin pesticidas. Ideal para mercado local y restauración.",
    location: "Sevilla",
    province: "Sevilla",
    seller: {
      id: "me",
      name: "Dev User",
      initials: "DU",
      rating: 0,
      sales: 0,
      location: "Sevilla",
    },
    images: [],
    createdAt: "2026-05-01",
  },
  {
    id: "p_mine_2",
    name: "Pimiento verde lamuyo",
    category: "Semillas",
    price: 1.8,
    unit: "€/kg",
    stock: 0,
    description:
      "Pimiento verde variedad lamuyo, calibre extra. Sin stock temporalmente.",
    location: "Sevilla",
    province: "Sevilla",
    seller: {
      id: "me",
      name: "Dev User",
      initials: "DU",
      rating: 0,
      sales: 0,
      location: "Sevilla",
    },
    images: [],
    createdAt: "2026-05-10",
  },
];

// ✅ FIX: la condición anterior comprobaba que la URL no tuviese "http",
// pero .env tiene "http://localhost:3000" → nunca se activaba el mock.
// Ahora se activa con EXPO_PUBLIC_USE_MOCK=true en el .env.
const isDev = () => __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK === "true";
// ─────────────────────────────────────────────────────────────

interface ProductsContextType {
  products: Product[];
  myProducts: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchMyProducts: () => Promise<void>;
  getProductById: (id: string) => Promise<Product>;
  createProduct: (dto: CreateProductDto) => Promise<Product>;
  updateProduct: (id: string, dto: UpdateProductDto) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  filterByCategory: (category: ProductCategory | "Todos") => Product[];
  search: (query: string) => Product[];
}

export const ProductsContext = createContext<ProductsContextType | null>(null);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async <T,>(fn: () => Promise<T>): Promise<T> => {
    setError(null);
    setLoading(true);
    try {
      return await fn();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error inesperado";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = useCallback(async () => {
    await run(async () => {
      if (isDev()) {
        await new Promise((r) => setTimeout(r, 300));
        // Merge: añade los mocks que no existan ya (evita sobreescribir
        // productos creados de forma optimista durante la sesión)
        setProducts((prev) => {
          const prevIds = new Set(prev.map((p) => p.id));
          const newMocks = MOCK_PRODUCTS.filter((p) => !prevIds.has(p.id));
          return prev.length === 0
            ? [...MOCK_PRODUCTS]
            : [...prev, ...newMocks];
        });
        return;
      }
      const data = await getAllProductsRequest();
      setProducts(data);
    });
  }, []);

  const fetchMyProducts = useCallback(async () => {
    await run(async () => {
      if (isDev()) {
        setMyProducts(MOCK_PRODUCTS.filter((p) => p.seller.id === "me"));
        return;
      }
      const data = await getMyProductsRequest();
      setMyProducts(data);
    });
  }, []);

  const getProductById = async (id: string): Promise<Product> => {
    const local = products.find((p) => p.id === id);
    if (local) return local;

    if (isDev()) {
      const found = MOCK_PRODUCTS.find((p) => p.id === id);
      if (found) return found;
      throw new Error("Producto no encontrado");
    }

    return run(() => getProductByIdRequest(id));
  };

  const createProduct = async (dto: CreateProductDto): Promise<Product> => {
    return run(async () => {
      if (isDev()) {
        const newProduct: Product = {
          id: `p_${Date.now()}`,
          name: dto.name,
          category: dto.category,
          price: dto.price,
          unit: dto.unit,
          stock: dto.stock,
          description: dto.description,
          province: dto.province,
          location: dto.province,
          seller: {
            id: "me",
            name: "Mi Cuenta",
            initials: "MC",
            rating: 0,
            sales: 0,
            location: dto.province,
          },
          images: dto.images ?? [],
          createdAt: new Date().toISOString().split("T")[0],
        };
        setProducts((prev) => [newProduct, ...prev]);
        setMyProducts((prev) => [newProduct, ...prev]);
        return newProduct;
      }

      const product = await createProductRequest(dto);
      setProducts((prev) => [product, ...prev]);
      setMyProducts((prev) => [product, ...prev]);
      return product;
    });
  };

  const updateProduct = async (
    id: string,
    dto: UpdateProductDto,
  ): Promise<Product> => {
    return run(async () => {
      if (isDev()) {
        const existing = products.find((p) => p.id === id);
        if (!existing) throw new Error("Producto no encontrado");
        const updated: Product = { ...existing, ...dto };
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        setMyProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return updated;
      }
      const updated = await updateProductRequest(id, dto);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setMyProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    });
  };

  const deleteProduct = async (id: string): Promise<void> => {
    return run(async () => {
      if (isDev()) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setMyProducts((prev) => prev.filter((p) => p.id !== id));
        return;
      }
      await deleteProductRequest(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setMyProducts((prev) => prev.filter((p) => p.id !== id));
    });
  };

  const filterByCategory = (category: ProductCategory | "Todos"): Product[] => {
    if (category === "Todos") return products;
    return products.filter((p) => p.category === category);
  };

  const search = (query: string): Product[] => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.seller.name.toLowerCase().includes(q),
    );
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        myProducts,
        loading,
        error,
        fetchProducts,
        fetchMyProducts,
        getProductById,
        createProduct,
        updateProduct,
        deleteProduct,
        filterByCategory,
        search,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};
