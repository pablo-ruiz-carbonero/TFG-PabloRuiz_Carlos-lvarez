// src/services/productsService.ts
import {
  Product,
  ProductCategory,
  CreateProductRequest,
} from "../types/products";

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
];

export const productsService = {
  async getAllProducts(): Promise<Product[]> {
    await new Promise((r) => setTimeout(r, 400));
    return [...MOCK_PRODUCTS];
  },

  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_PRODUCTS.filter((p) => p.category === category);
  },

  async getProductById(id: string): Promise<Product> {
    await new Promise((r) => setTimeout(r, 300));
    const p = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!p) throw new Error("Producto no encontrado");
    return p;
  },

  async searchProducts(query: string): Promise<Product[]> {
    await new Promise((r) => setTimeout(r, 200));
    const q = query.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q),
    );
  },

  async createProduct(data: CreateProductRequest): Promise<Product> {
    await new Promise((r) => setTimeout(r, 600));
    const newProduct: Product = {
      id: `p_${Date.now()}`,
      ...data,
      location: data.province,
      seller: {
        id: "me",
        name: "Mi Cuenta",
        initials: "MC",
        rating: 0,
        sales: 0,
        location: data.province,
      },
      images: [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    MOCK_PRODUCTS.unshift(newProduct);
    return newProduct;
  },
};
