import { api } from './api';
import { dbService } from './mockDb';
import { Product } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const marketService = {
  getProducts: async (): Promise<Product[]> => {
    if (USE_MOCK) {
      await delay(500);
      return dbService.getProducts();
    } else {
      return api.get('/products');
    }
  },

  addProduct: async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    if (USE_MOCK) {
      await delay(600);
      return dbService.addProduct(productData);
    } else {
      return api.post('/products', productData);
    }
  },

  updateProduct: async (productId: string, updated: Partial<Product>): Promise<Product> => {
    if (USE_MOCK) {
      await delay(400);
      return dbService.updateProduct(productId, updated);
    } else {
      return api.put(`/products/${productId}`, updated);
    }
  },

  deleteProduct: async (productId: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(400);
      return dbService.deleteProduct(productId);
    } else {
      return api.delete(`/products/${productId}`);
    }
  }
};
