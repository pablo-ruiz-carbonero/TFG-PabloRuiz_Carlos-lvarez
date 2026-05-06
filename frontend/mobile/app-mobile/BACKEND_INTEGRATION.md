  # Guía de Integración del Backend - Sistema de Cultivos

  ## 📱 Descripción General

  El sistema de cultivos está completamente funcional con datos mock y está 100% preparado para conectarse a un backend real. Solo necesitas:

  1. Cambiar la URL base del API
  2. Descomenta las llamadas fetch en `cropsService.ts`
  3. Implementar los endpoints en tu backend

  ## 🔧 Pasos de Integración

  ### Paso 1: Configura la URL del API

  En `src/services/cropsService.ts`, actualiza:

  ```typescript
  // Línea 3
  const API_BASE_URL = "http://localhost:3000/api"; // Cambiar según tu backend
  ```

  Ejemplo para diferentes entornos:
  ```typescript
  // Desarrollo
  const API_BASE_URL = "http://localhost:3000/api";

  // Producción
  const API_BASE_URL = "https://tudominio.com/api";

  // Staging
  const API_BASE_URL = "https://staging-api.tudominio.com/api";
  ```

  ### Paso 2: Descomenta las llamadas fetch

  Cada método en `cropsService.ts` tiene comentarios mostrando dónde descomenta el código. Ejemplo:

  #### Método actual (mock):
  ```typescript
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
  }
  ```

  #### Descomenta así:
  ```typescript
  async getAllCrops(): Promise<Crop[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/crops`);
      if (!response.ok) throw new Error("Failed to fetch crops");
      return response.json();
    } catch (error) {
      console.error("Error fetching crops:", error);
      throw error;
    }
  }
  ```

  ### Paso 3: Implementa los Endpoints en tu Backend

  Tu backend necesita implementar estos endpoints:

  #### 1. GET `/api/crops` - Obtener todos los cultivos
  ```javascript
  // Respuesta esperada
  [
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
      createdAt: "2026-03-12T00:00:00Z",
      updatedAt: "2026-05-04T00:00:00Z"
    },
    // ... más cultivos
  ]
  ```

  #### 2. GET `/api/crops/:id` - Obtener cultivo específico
  ```javascript
  // Respuesta: Un objeto Crop como arriba
  ```

  #### 3. POST `/api/crops` - Crear cultivo
  ```javascript
  // Request body
  {
    "name": "Tomate",
    "variety": "Cherry",
    "cropType": "Hortalizas",
    "parcelId": "P1",
    "surfaceArea": 0.5,
    "seedDate": "2026-05-04",
    "notes": "Cultivo de invernadero"
  }

  // Respuesta (201 Created)
  {
    "id": "nuevo-id",
    "name": "Tomate",
    "variety": "Cherry",
    // ... resto del objeto Crop
    "status": "active",
    "createdAt": "2026-05-04T10:30:00Z",
    "updatedAt": "2026-05-04T10:30:00Z"
  }
  ```

  #### 4. PUT `/api/crops/:id` - Actualizar cultivo
  ```javascript
  // Request body (todos los campos son opcionales)
  {
    "name": "Tomate Rojo",
    "currentPhase": "Floración",
    "expectedHarvest": "2026-06-15",
    "notes": "Actualizado"
  }

  // Respuesta: Objeto Crop actualizado
  ```

  #### 5. DELETE `/api/crops/:id` - Eliminar cultivo
  ```javascript
  // Respuesta: 204 No Content o:
  {
    "message": "Cultivo eliminado"
  }
  ```

  #### 6. GET `/api/parcels` - Obtener parcelas
  ```javascript
  // Respuesta esperada
  [
    {
      "id": "P1",
      "name": "Parcela A1",
      "location": "Zona Norte",
      "size": 1.2
    },
    {
      "id": "P2",
      "name": "Parcela B1",
      "location": "Zona Sur",
      "size": 0.8
    }
  ]
  ```

  ## 📋 Estructura de Tipos TypeScript

  Asegúrate de que tu respuesta del backend coincida con estos tipos:

  ```typescript
  interface Crop {
    id: string;
    name: string;
    variety: string;
    cropType: string;
    parcelId: string;
    parcelName?: string;
    surfaceArea: number; // hectáreas
    seedDate: string; // YYYY-MM-DD
    currentPhase: string;
    expectedHarvest?: string;
    daysOld?: number;
    notes?: string;
    tasksCount: number;
    lastWatering?: string;
    lastFertilization?: string;
    expectedProduction?: number;
    irrigationDays?: number;
    fertilizationDays?: number;
    image?: string;
    status: 'active' | 'completed' | 'archived';
    createdAt: string; // ISO date
    updatedAt: string; // ISO date
  }

  interface Parcel {
    id: string;
    name: string;
    location?: string;
    size: number;
  }
  ```

  ## 🔐 Autenticación y Headers

  Si tu backend requiere autenticación, actualiza `cropsService.ts`:

  ```typescript
  async getAllCrops(): Promise<Crop[]> {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/crops`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Si es necesario
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado o inválido
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch crops");
      }
      
      return response.json();
    } catch (error) {
      console.error("Error fetching crops:", error);
      throw error;
    }
  }
  ```

  ## ⚡ Mejoras Opcionales

  ### 1. Agregar Token de Autenticación en Todas las Peticiones

  Crea un helper en `cropsService.ts`:

  ```typescript
  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  };
  ```

  ### 2. Manejo de Errores Mejorado

  ```typescript
  if (response.status === 401) {
    // Token expirado - redirigir a login
    await AsyncStorage.removeItem("token");
    navigation.reset({ routes: [{ name: 'Login' }] });
  }

  if (response.status === 400) {
    // Validación fallida
    const error = await response.json();
    throw new Error(error.message || "Validación falló");
  }

  if (response.status === 500) {
    // Error del servidor
    throw new Error("Error del servidor. Intenta más tarde");
  }
  ```

  ### 3. Caché Local

  Usa AsyncStorage para cachear datos:

  ```typescript
  async getAllCrops(): Promise<Crop[]> {
    try {
      // Intentar obtener del cache
      const cached = await AsyncStorage.getItem("crops_cache");
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Si no hay cache, obtener del API
      const crops = await fetch(...);
      
      // Guardar en cache
      await AsyncStorage.setItem("crops_cache", JSON.stringify(crops));
      
      return crops;
    } catch (error) {
      // Si falla, devolver cache como fallback
      const cached = await AsyncStorage.getItem("crops_cache");
      if (cached) return JSON.parse(cached);
      
      throw error;
    }
  }
  ```

  ## 🧪 Pruebas

  ### Probar localmente con mock data
  ```bash
  # El código actual usa mock data, no necesitas backend para empezar
  npm start
  # Los cultivos mock aparecerán automáticamente
  ```

  ### Cuando cambies a backend real
  ```bash
  # 1. Asegúrate de que tu backend está corriendo
  # 2. Actualiza API_BASE_URL en cropsService.ts
  # 3. Descomenta las llamadas fetch
  # 4. Prueba en el navegador DevTools
  ```

  ## 📊 Flujo de Datos

  ```
  Usuario abre CropsScreen
          ↓
  loadCrops() se ejecuta
          ↓
  cropsService.getAllCrops()
          ↓
  Fetch de API_BASE_URL/crops (o mock data)
          ↓
  Datos llegan a componente
          ↓
  FlatList renderiza los cultivos
  ```

  ## 🐛 Debugging

  Para verificar qué está pasando:

  ```typescript
  // En cropsService.ts, agrega logs
  async getAllCrops(): Promise<Crop[]> {
    try {
      console.log("Fetching crops from:", API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/crops`);
      const data = await response.json();
      
      console.log("Crops received:", data);
      
      return data;
    } catch (error) {
      console.error("Error fetching crops:", error);
      throw error;
    }
  }
  ```

  Luego abre React Native Debugger o Flipper para ver los logs.

  ## ✅ Checklist de Integración

  - [ ] Cambiaste API_BASE_URL a tu backend
  - [ ] Descomentaste las llamadas fetch
  - [ ] Implementaste los 6 endpoints en backend
  - [ ] Probaste GET /crops devuelve formato correcto
  - [ ] Probaste POST /crops crea cultivo
  - [ ] Probaste GET /crops/:id obtiene cultivo
  - [ ] Probaste PUT /crops/:id actualiza cultivo
  - [ ] Probaste DELETE /crops/:id elimina cultivo
  - [ ] Probaste GET /parcels devuelve parcelas
  - [ ] Agregaste autenticación si es necesaria
  - [ ] Manejaste errores 401/403/500 correctamente
  - [ ] Probaste en dispositivo real o emulador

  ## 🎉 ¡Listo!

  Una vez completados estos pasos, tu aplicación estará completamente integrada con tu backend y lista para producción.
