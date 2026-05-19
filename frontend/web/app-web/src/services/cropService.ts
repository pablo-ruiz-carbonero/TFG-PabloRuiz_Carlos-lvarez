import { api } from './api';
import { dbService } from './mockDb';
import { Crop, Activity } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const cropService = {
  getCrops: async (farmerId: string): Promise<Crop[]> => {
    if (USE_MOCK) {
      await delay(400);
      return dbService.getCrops(farmerId);
    } else {
      return api.get(`/crops/farmer/${farmerId}`);
    }
  },

  getAllCrops: async (): Promise<Crop[]> => {
    if (USE_MOCK) {
      await delay(400);
      return dbService.getAllCrops();
    } else {
      return api.get('/crops');
    }
  },

  addCrop: async (cropData: Omit<Crop, 'id' | 'activities'>): Promise<Crop> => {
    if (USE_MOCK) {
      await delay(500);
      return dbService.addCrop(cropData);
    } else {
      return api.post('/crops', cropData);
    }
  },

  updateCrop: async (cropId: string, updated: Partial<Crop>): Promise<Crop> => {
    if (USE_MOCK) {
      await delay(400);
      return dbService.updateCrop(cropId, updated);
    } else {
      return api.put(`/crops/${cropId}`, updated);
    }
  },

  deleteCrop: async (cropId: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(400);
      return dbService.deleteCrop(cropId);
    } else {
      return api.delete(`/crops/${cropId}`);
    }
  },

  // Activities
  addActivity: async (cropId: string, activityData: Omit<Activity, 'id' | 'cropId'>): Promise<Activity> => {
    if (USE_MOCK) {
      await delay(300);
      return dbService.addActivity(cropId, activityData);
    } else {
      return api.post(`/crops/${cropId}/activities`, activityData);
    }
  },

  deleteActivity: async (cropId: string, activityId: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      return dbService.deleteActivity(cropId, activityId);
    } else {
      return api.delete(`/crops/${cropId}/activities/${activityId}`);
    }
  }
};
