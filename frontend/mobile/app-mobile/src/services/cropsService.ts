// src/services/cropsService.ts
import { Crop, CreateCropRequest, UpdateCropRequest, Parcel } from "../types/crops";

const API_BASE_URL = "http://localhost:3000/api"; // Cambiar según tu backend

// Mock data para desarrollo
const mockCrops: Crop[] = [
  {
    id: "1",
    name: "Tomate Cherry",
    variety: "Sweet 100",
    cropType: "Hortalizas",
    parcelId: "P1",
    parcelName: "Parcela A1",
    surfaceArea: 0.5,
    seedDate: "2026-03-12",
    currentPhase: "En plántano",
    daysOld: 45,
    expectedHarvest: "2026-06-12",
    expectedProduction: 500,
    tasksCount: 3,
    lastWatering: "2026-05-04",
    lastFertilization: "2026-05-01",
    irrigationDays: 2,
    fertilizationDays: 7,
    notes: "Cultivo principal de invernadero",
    status: "active",
    createdAt: "2026-03-12",
    updatedAt: "2026-05-04",
  },
  {
    id: "2",
    name: "Pimiento Rojo",
    variety: "California",
    cropType: "Hortalizas",
    parcelId: "P2",
    parcelName: "Parcela B1",
    surfaceArea: 0.8,
    seedDate: "2026-02-20",
    currentPhase: "Crecimiento",
    daysOld: 74,
    expectedHarvest: "2026-07-20",
    expectedProduction: 800,
    tasksCount: 2,
    lastWatering: "2026-05-04",
    lastFertilization: "2026-04-28",
    irrigationDays: 2,
    fertilizationDays: 10,
    notes: "Cultivo resistente a plagas",
    status: "active",
    createdAt: "2026-02-20",
    updatedAt: "2026-05-04",
  },
  {
    id: "3",
    name: "Lechuga",
    variety: "Iceberg",
    cropType: "Verduras",
    parcelId: "P1",
    parcelName: "Parcela A2",
    surfaceArea: 0.3,
    seedDate: "2026-04-10",
    currentPhase: "Crecimiento",
    daysOld: 24,
    expectedHarvest: "2026-05-25",
    expectedProduction: 200,
    tasksCount: 1,
    lastWatering: "2026-05-04",
    lastFertilization: "2026-04-25",
    irrigationDays: 1,
    fertilizationDays: 14,
    notes: "Cosecha próxima",
    status: "active",
    createdAt: "2026-04-10",
    updatedAt: "2026-05-04",
  },
];

export const cropsService = {
  // Obtener todos los cultivos
  async getAllCrops(): Promise<Crop[]> {
    try {
      // Descomentar cuando el backend esté listo:
      // const response = await fetch(`${API_BASE_URL}/crops`);
      // return response.json();
      
      // Por ahora, devolvemos datos mock
      return mockCrops;
    } catch (error) {
      console.error("Error fetching crops:", error);
      throw error;
    }
  },

  // Obtener un cultivo por ID
  async getCropById(cropId: string): Promise<Crop> {
    try {
      // Descomentar cuando el backend esté listo:
      // const response = await fetch(`${API_BASE_URL}/crops/${cropId}`);
      // return response.json();
      
      const crop = mockCrops.find(c => c.id === cropId);
      if (!crop) throw new Error("Cultivo no encontrado");
      return crop;
    } catch (error) {
      console.error("Error fetching crop:", error);
      throw error;
    }
  },

  // Crear nuevo cultivo
  async createCrop(data: CreateCropRequest): Promise<Crop> {
    try {
      // Descomentar cuando el backend esté listo:
      // const response = await fetch(`${API_BASE_URL}/crops`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // return response.json();
      
      const newCrop: Crop = {
        id: Math.random().toString(),
        ...data,
        currentPhase: "Plántula",
        tasksCount: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockCrops.push(newCrop);
      return newCrop;
    } catch (error) {
      console.error("Error creating crop:", error);
      throw error;
    }
  },

  // Actualizar cultivo
  async updateCrop(cropId: string, data: UpdateCropRequest): Promise<Crop> {
    try {
      // Descomentar cuando el backend esté listo:
      // const response = await fetch(`${API_BASE_URL}/crops/${cropId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // return response.json();
      
      const index = mockCrops.findIndex(c => c.id === cropId);
      if (index === -1) throw new Error("Cultivo no encontrado");
      
      mockCrops[index] = {
        ...mockCrops[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockCrops[index];
    } catch (error) {
      console.error("Error updating crop:", error);
      throw error;
    }
  },

  // Eliminar cultivo
  async deleteCrop(cropId: string): Promise<void> {
    try {
      // Descomentar cuando el backend esté listo:
      // await fetch(`${API_BASE_URL}/crops/${cropId}`, { method: 'DELETE' });
      
      const index = mockCrops.findIndex(c => c.id === cropId);
      if (index > -1) {
        mockCrops.splice(index, 1);
      }
    } catch (error) {
      console.error("Error deleting crop:", error);
      throw error;
    }
  },

  // Obtener parcelas (para el selector en NewCorpScreen)
  async getParcels(): Promise<Parcel[]> {
    try {
      // Descomentar cuando el backend esté listo:
      // const response = await fetch(`${API_BASE_URL}/parcels`);
      // return response.json();
      
      return [
        { id: "P1", name: "Parcela A1", location: "Zona Norte", size: 1.2 },
        { id: "P2", name: "Parcela B1", location: "Zona Sur", size: 0.8 },
        { id: "P3", name: "Parcela C1", location: "Zona Este", size: 1.5 },
      ];
    } catch (error) {
      console.error("Error fetching parcels:", error);
      throw error;
    }
  },
};
