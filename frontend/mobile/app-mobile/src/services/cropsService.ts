// src/services/cropsService.ts
import { Crop, CreateCropRequest, UpdateCropRequest, Parcel } from "../types/crops";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.179:3000";

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const cropsService = {
  // Obtener todos los cultivos
  async getAllCrops(): Promise<Crop[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/crops`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Error al obtener cultivos');
      }

      const crops = await response.json();

      // Transformar datos del backend al formato del frontend
      return crops.map((crop: any) => ({
        id: crop.id.toString(),
        name: crop.nombre,
        variety: crop.variedad,
        cropType: crop.tipo_cultivo,
        parcelId: crop.parcela_id?.toString() || '',
        parcelName: `Parcela ${crop.parcela_id || 'N/A'}`,
        surfaceArea: parseFloat(crop.superficie),
        seedDate: crop.fecha_siembra,
        currentPhase: crop.fase_actual || 'Plántula',
        expectedHarvest: crop.fecha_cosecha_esperada,
        daysOld: Math.floor((new Date().getTime() - new Date(crop.fecha_siembra).getTime()) / (1000 * 60 * 60 * 24)),
        notes: crop.notas,
        tasksCount: 0, // Se calculará después
        lastWatering: crop.ultimo_riego,
        lastFertilization: crop.ultima_fertilizacion,
        expectedProduction: crop.produccion_esperada,
        irrigationDays: crop.dias_riego,
        fertilizationDays: crop.dias_fertilizacion,
        status: crop.status,
        createdAt: crop.fecha_creacion,
        updatedAt: crop.updatedAt,
      }));
    } catch (error) {
      console.error("Error fetching crops:", error);
      throw error;
    }
  },

  // Obtener un cultivo por ID
  async getCropById(cropId: string): Promise<Crop> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/crops/${cropId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Error al obtener cultivo');
      }

      const crop = await response.json();

      return {
        id: crop.id.toString(),
        name: crop.nombre,
        variety: crop.variedad,
        cropType: crop.tipo_cultivo,
        parcelId: crop.parcela_id?.toString() || '',
        parcelName: `Parcela ${crop.parcela_id || 'N/A'}`,
        surfaceArea: parseFloat(crop.superficie),
        seedDate: crop.fecha_siembra,
        currentPhase: crop.fase_actual || 'Plántula',
        expectedHarvest: crop.fecha_cosecha_esperada,
        daysOld: Math.floor((new Date().getTime() - new Date(crop.fecha_siembra).getTime()) / (1000 * 60 * 60 * 24)),
        notes: crop.notas,
        tasksCount: 0,
        lastWatering: crop.ultimo_riego,
        lastFertilization: crop.ultima_fertilizacion,
        expectedProduction: crop.produccion_esperada,
        irrigationDays: crop.dias_riego,
        fertilizationDays: crop.dias_fertilizacion,
        status: crop.status,
        createdAt: crop.fecha_creacion,
        updatedAt: crop.updatedAt,
      };
    } catch (error) {
      console.error("Error fetching crop:", error);
      throw error;
    }
  },

  // Crear nuevo cultivo
  async createCrop(data: CreateCropRequest): Promise<Crop> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/crops`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          nombre: data.name,
          variedad: data.variety,
          tipo_cultivo: data.cropType,
          parcela_id: parseInt(data.parcelId),
          superficie: data.surfaceArea,
          fecha_siembra: data.seedDate,
          notas: data.notes,
          fase_actual: 'Plántula',
          dias_riego: 2,
          dias_fertilizacion: 7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear cultivo');
      }

      const crop = await response.json();

      return {
        id: crop.id.toString(),
        name: crop.nombre,
        variety: crop.variedad,
        cropType: crop.tipo_cultivo,
        parcelId: crop.parcela_id?.toString() || '',
        parcelName: `Parcela ${crop.parcela_id || 'N/A'}`,
        surfaceArea: parseFloat(crop.superficie),
        seedDate: crop.fecha_siembra,
        currentPhase: crop.fase_actual || 'Plántula',
        expectedHarvest: crop.fecha_cosecha_esperada,
        daysOld: 0,
        notes: crop.notas,
        tasksCount: 0,
        lastWatering: crop.ultimo_riego,
        lastFertilization: crop.ultima_fertilizacion,
        expectedProduction: crop.produccion_esperada,
        irrigationDays: crop.dias_riego,
        fertilizationDays: crop.dias_fertilizacion,
        status: crop.status,
        createdAt: crop.fecha_creacion,
        updatedAt: crop.updatedAt,
      };
    } catch (error) {
      console.error("Error creating crop:", error);
      throw error;
    }
  },

  // Actualizar cultivo
  async updateCrop(cropId: string, data: UpdateCropRequest): Promise<Crop> {
    try {
      const headers = await getAuthHeaders();
      const updateData: any = {};

      if (data.name) updateData.nombre = data.name;
      if (data.variety) updateData.variedad = data.variety;
      if (data.cropType) updateData.tipo_cultivo = data.cropType;
      if (data.parcelId) updateData.parcela_id = parseInt(data.parcelId);
      if (data.surfaceArea !== undefined) updateData.superficie = data.surfaceArea;
      if (data.seedDate) updateData.fecha_siembra = data.seedDate;
      if (data.currentPhase) updateData.fase_actual = data.currentPhase;
      if (data.expectedHarvest) updateData.fecha_cosecha_esperada = data.expectedHarvest;
      if (data.notes !== undefined) updateData.notas = data.notes;
      if (data.status) updateData.status = data.status;

      const response = await fetch(`${API_BASE_URL}/crops/${cropId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar cultivo');
      }

      const crop = await response.json();

      return {
        id: crop.id.toString(),
        name: crop.nombre,
        variety: crop.variedad,
        cropType: crop.tipo_cultivo,
        parcelId: crop.parcela_id?.toString() || '',
        parcelName: `Parcela ${crop.parcela_id || 'N/A'}`,
        surfaceArea: parseFloat(crop.superficie),
        seedDate: crop.fecha_siembra,
        currentPhase: crop.fase_actual || 'Plántula',
        expectedHarvest: crop.fecha_cosecha_esperada,
        daysOld: Math.floor((new Date().getTime() - new Date(crop.fecha_siembra).getTime()) / (1000 * 60 * 60 * 24)),
        notes: crop.notas,
        tasksCount: 0,
        lastWatering: crop.ultimo_riego,
        lastFertilization: crop.ultima_fertilizacion,
        expectedProduction: crop.produccion_esperada,
        irrigationDays: crop.dias_riego,
        fertilizationDays: crop.dias_fertilizacion,
        status: crop.status,
        createdAt: crop.fecha_creacion,
        updatedAt: crop.updatedAt,
      };
    } catch (error) {
      console.error("Error updating crop:", error);
      throw error;
    }
  },

  // Eliminar cultivo
  async deleteCrop(cropId: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/crops/${cropId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar cultivo');
      }
    } catch (error) {
      console.error("Error deleting crop:", error);
      throw error;
    }
  },

  // Obtener parcelas
  async getParcels(): Promise<Parcel[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/crops/parcels/list`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Error al obtener parcelas');
      }

      const parcels = await response.json();

      return parcels.map((parcel: any) => ({
        id: parcel.id.toString(),
        name: parcel.nombre,
        location: parcel.ubicacion,
        size: parcel.tamano,
      }));
    } catch (error) {
      console.error("Error fetching parcels:", error);
      throw error;
    }
  },
};
