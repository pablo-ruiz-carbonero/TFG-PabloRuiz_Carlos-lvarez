# AgroLink Mobile — Documentación Técnica

> Generada el 20/05/2026. Basada en el código fuente de `app-mobile`.

---

## Índice

1. [Visión general](#1-visión-general)
2. [Arquitectura del proyecto](#2-arquitectura-del-proyecto)
3. [Navegación](#3-navegación)
4. [Features](#4-features)
   - [Auth](#41-auth)
   - [Crops (Cultivos)](#42-crops-cultivos)
   - [Products (Marketplace)](#43-products-marketplace)
   - [Chat](#44-chat)
   - [Weather (Clima)](#45-weather-clima)
5. [Sistema de estilos](#5-sistema-de-estilos)
6. [Variables de entorno](#6-variables-de-entorno)
7. [Limpieza recomendada](#7-limpieza-recomendada)
8. [Conexión al backend NestJS](#8-conexión-al-backend-nestjs)
   - [Configuración base](#81-configuración-base)
   - [Auth endpoints](#82-auth-endpoints)
   - [Crops endpoints](#83-crops-endpoints)
   - [Tasks endpoints](#84-tasks-endpoints)
   - [Products endpoints](#85-products-endpoints)
   - [Chat endpoints](#86-chat-endpoints)
   - [WebSocket (Chat en tiempo real)](#87-websocket-chat-en-tiempo-real)
   - [Eliminar el modo mock](#88-eliminar-el-modo-mock)

---

## 1. Visión general

AgroLink es una app móvil para agricultores construida con **React Native + Expo**. Permite:

- Gestionar cultivos y sus tareas de campo (riego, fertilización, siembra, cosecha)
- Consultar el tiempo meteorológico por GPS o ciudad
- Comprar y vender productos agrícolas en un marketplace
- Comunicarse con otros usuarios mediante chat
- Gestionar el perfil y seguridad de la cuenta

El frontend está desacoplado del backend mediante una capa de API en cada feature. Existe un **modo mock** (`EXPO_PUBLIC_USE_MOCK=true`) que permite trabajar sin backend activo.

---

## 2. Arquitectura del proyecto

```
src/
├── components/          # Componentes reutilizables globales
│   ├── Divider.tsx
│   ├── PerfilMenu.tsx
│   └── WeatherCard.tsx
│
├── core/
│   └── hooks/
│       └── useKeyboardAwareScroll.ts   # Hook para scroll con teclado
│
├── features/            # Módulos por dominio (cada uno autocontenido)
│   ├── auth/
│   │   ├── api/         # Llamadas HTTP puras
│   │   ├── context/     # Estado global (AuthContext + Provider)
│   │   ├── hooks/       # useAuth, useAuthForm
│   │   ├── types/       # Interfaces TypeScript
│   │   └── utils/       # tokenStorage (AsyncStorage)
│   ├── crops/
│   ├── products/
│   ├── chat/
│   └── weather/
│
├── navigation/
│   ├── AppNavigator.tsx  # Raíz: decide Auth vs Main según sesión
│   ├── AuthStack.tsx     # Login + Register
│   ├── BottomNav.tsx     # Tabs principales
│   └── MainStack.tsx     # Stack sobre los tabs
│
├── screens/             # Pantallas (consumen hooks de features/)
│   ├── HomeScreen.tsx
│   ├── WeatherScreen.tsx
│   ├── NotificationsScreen.tsx
│   ├── auth/profile/
│   ├── crops/
│   ├── chat/
│   └── product/
│
├── styles/
│   ├── Globaltheme.ts   # Design system: colors, spacing, font, radius, shared
│   ├── auth/
│   └── crops/
│
└── types/
    └── navigation.ts    # RootStackParamList + BottomTabParamList
```

### Patrón por feature

Cada feature sigue el mismo patrón de 5 capas:

```
api.ts         → fetch puro contra el backend
types.ts       → interfaces TypeScript (DTOs + modelos de dominio)
mappers.ts     → transforma respuestas del backend al modelo del frontend
context.tsx    → estado global + acciones + mock de desarrollo
hooks/         → useXxx() — acceso tipado al contexto desde pantallas
```

Las pantallas **solo importan hooks**. Nunca acceden directamente a la API ni al contexto.

---

## 3. Navegación

### Estructura de navegadores

```
AppNavigator
├── AuthStack (si no hay usuario)
│   ├── Login
│   └── Register
│
└── MainStack (si hay usuario)
    ├── BottomNav (raíz del stack)
    │   ├── Home
    │   ├── Crops
    │   ├── MarketPlace
    │   └── Chats
    ├── WeatherScreen
    ├── ProfileScreen
    ├── EditProfileScreen
    ├── ChangePasswordScreen
    ├── NotificationsScreen
    ├── NewCropScreen
    ├── DetailCropScreen       { cropId: string }
    ├── NewTask                { cropId: string; preselect?: string }
    ├── ProductDetailScreen    { productId: string }
    ├── PublishProductScreen
    ├── MyListingsScreen
    └── ChatScreen             { conversationId, participantName, participantInitials, online }
```

### Navegación desde tabs anidados

Las pantallas dentro de `BottomNav` deben usar `NativeStackNavigationProp<RootStackParamList>` para navegar al stack padre:

```typescript
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type Nav = NativeStackNavigationProp<RootStackParamList>;
const navigation = useNavigation<Nav>();

// Correcto — navega al MainStack aunque estés dentro de un Tab
navigation.navigate("NewCropScreen");
```

---

## 4. Features

### 4.1 Auth

**Archivos relevantes:**

- `features/auth/api/authApi.ts`
- `features/auth/context/AuthContext.tsx`
- `features/auth/hooks/useAuth.ts`
- `features/auth/utils/tokenStorage.ts`

**Estado global disponible via `useAuth()`:**

| Propiedad / Método       | Tipo             | Descripción                                |
| ------------------------ | ---------------- | ------------------------------------------ |
| `user`                   | `User \| null`   | Usuario autenticado                        |
| `token`                  | `string \| null` | JWT en memoria                             |
| `loading`                | `boolean`        | Inicializando sesión guardada              |
| `isDevMode`              | `boolean`        | Si `__DEV__` está activo                   |
| `login(email, password)` | `Promise<void>`  | Login y guarda token                       |
| `register(dto)`          | `Promise<void>`  | Registro y guarda token                    |
| `logout()`               | `Promise<void>`  | Limpia sesión y AsyncStorage               |
| `updateProfile(dto)`     | `Promise<void>`  | Actualiza nombre/teléfono/rol              |
| `changePassword(dto)`    | `Promise<void>`  | Cambia contraseña                          |
| `devLogin()`             | `void`           | Acceso rápido sin backend (solo `__DEV__`) |

**Modelo `User`:**

```typescript
interface User {
  id: number;
  email: string;
  nombre?: string;
  telefono?: string;
  rol?: string;
}
```

**Flujo de sesión:**

1. Al arrancar, `AuthContext` lee el token de `AsyncStorage`
2. Si existe, valida contra `GET /auth/me`
3. Si el token es inválido/caducado, lo borra y manda al login
4. El `AppNavigator` renderiza `AuthStack` o `MainStack` según `user !== null`

**Token storage:** `AsyncStorage` con clave `auth_token`. El token se inyecta automáticamente en todas las peticiones autenticadas.

---

### 4.2 Crops (Cultivos)

**Archivos relevantes:**

- `features/crops/api/cropsApi.ts` — CRUD de cultivos + parcelas
- `features/crops/api/tasksApi.ts` — CRUD de tareas
- `features/crops/context/CropsContext.tsx` — estado global
- `features/crops/hooks/useCrops.ts` — acceso al contexto
- `features/crops/hooks/useCropDetail.ts` — vista de un cultivo concreto
- `features/crops/utils/cropMappers.ts` — snake_case español → camelCase inglés

**Estado global disponible via `useCrops()`:**

| Propiedad / Método           | Tipo                     | Descripción                        |
| ---------------------------- | ------------------------ | ---------------------------------- |
| `crops`                      | `Crop[]`                 | Lista de cultivos del usuario      |
| `parcels`                    | `Parcel[]`               | Parcelas disponibles               |
| `tasks`                      | `Record<string, Task[]>` | Tareas indexadas por `cropId`      |
| `loading`                    | `boolean`                | Operación en curso                 |
| `error`                      | `string \| null`         | Último error                       |
| `fetchCrops()`               | `Promise<void>`          | Carga/refresca cultivos            |
| `fetchParcels()`             | `Promise<void>`          | Carga parcelas                     |
| `getCropById(id)`            | `Promise<Crop>`          | Busca primero en caché local       |
| `createCrop(dto)`            | `Promise<Crop>`          | Crea y añade al estado             |
| `updateCrop(id, dto)`        | `Promise<Crop>`          | Actualiza y sincroniza estado      |
| `deleteCrop(id)`             | `Promise<void>`          | Borra y limpia tareas              |
| `loadTasksForCrop(cropId)`   | `Promise<void>`          | Carga tareas de un cultivo         |
| `addTask(dto)`               | `Promise<Task>`          | Crea tarea                         |
| `toggleTask(cropId, taskId)` | `Promise<void>`          | Cambia estado pendiente↔completada |
| `removeTask(cropId, taskId)` | `Promise<void>`          | Elimina tarea                      |

**Vista de detalle via `useCropDetail(cropId)`:**

Wrapper sobre `useCrops` que expone solo los datos del cultivo dado:

```typescript
const {
  crop, // Crop | null
  tasks, // Task[]
  pendingTasks, // Task[]
  completedTasks, // Task[]
  loading,
  error,
  loadDetail, // carga cultivo + tareas
  addTask,
  toggleTask,
  removeTask,
  removeCrop,
} = useCropDetail(cropId);
```

**Modelo `Crop`:**

```typescript
interface Crop {
  id: string;
  name: string;
  variety: string;
  cropType: string; // "Hortalizas" | "Verduras" | "Frutas" | ...
  parcelId: string;
  parcelName: string;
  surfaceArea: number; // hectáreas
  seedDate: string; // YYYY-MM-DD
  currentPhase: CropPhase; // "Plántula" | "Crecimiento" | "Floración" | "Maduración" | "Cosecha"
  expectedHarvest?: string;
  daysOld: number; // calculado en el mapper
  notes?: string;
  tasksCount: number;
  lastWatering?: string; // ISO timestamp
  lastFertilization?: string;
  status: "active" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}
```

**Mapeo backend → frontend (cropMappers.ts):**

El backend devuelve campos en español y snake_case. El mapper los convierte:

| Backend                  | Frontend             |
| ------------------------ | -------------------- |
| `id`                     | `id.toString()`      |
| `nombre`                 | `name`               |
| `variedad`               | `variety`            |
| `tipo_cultivo`           | `cropType`           |
| `parcela_id`             | `parcelId`           |
| `parcela_nombre`         | `parcelName`         |
| `superficie`             | `surfaceArea`        |
| `fecha_siembra`          | `seedDate`           |
| `fase_actual`            | `currentPhase`       |
| `fecha_cosecha_esperada` | `expectedHarvest`    |
| `notas`                  | `notes`              |
| `tareas_count`           | `tasksCount`         |
| `ultimo_riego`           | `lastWatering`       |
| `ultima_fertilizacion`   | `lastFertilization`  |
| `produccion_esperada`    | `expectedProduction` |
| `dias_riego`             | `irrigationDays`     |
| `dias_fertilizacion`     | `fertilizationDays`  |

**Comportamiento especial de `toggleTask`:**
Cuando una tarea de tipo `Riego` o `Fertilización` pasa a `completada`, actualiza automáticamente `lastWatering` o `lastFertilization` del cultivo en el estado global — sin necesidad de hacer un refetch.

---

### 4.3 Products (Marketplace)

**Archivos relevantes:**

- `features/products/api/productsApi.ts`
- `features/products/context/ProductsContext.tsx`
- `features/products/hooks/useProducts.ts`

**Estado global via `useProducts()`:**

| Método                   | Descripción                                  |
| ------------------------ | -------------------------------------------- |
| `products`               | Todos los productos del marketplace          |
| `myProducts`             | Solo los del usuario autenticado             |
| `fetchProducts()`        | Carga catálogo completo                      |
| `fetchMyProducts()`      | Carga mis anuncios                           |
| `getProductById(id)`     | Busca en caché o hace fetch                  |
| `createProduct(dto)`     | Publica nuevo producto                       |
| `updateProduct(id, dto)` | Edita anuncio                                |
| `deleteProduct(id)`      | Elimina anuncio                              |
| `filterByCategory(cat)`  | Filtro local por categoría                   |
| `search(query)`          | Búsqueda local por nombre/ubicación/vendedor |

**Modelo `Product`:**

```typescript
interface Product {
  id: string;
  name: string;
  category:
    | "Semillas"
    | "Fertilizantes"
    | "Maquinaria"
    | "Fitosanitarios"
    | "Otros";
  price: number;
  unit: "€/kg" | "€/u" | "€/L" | "€/ha" | "€/saco";
  stock: number;
  description: string;
  location: string;
  province: string;
  seller: Seller;
  images: string[];
  createdAt: string;
}
```

**El campo enviado al backend en `createProduct`:**

```json
{ "nombre", "categoria", "precio", "unidad", "stock", "descripcion", "provincia" }
```

El backend devuelve el objeto `Product` completo con `seller` ya resuelto.

---

### 4.4 Chat

**Archivos relevantes:**

- `features/chat/api/chatApi.ts`
- `features/chat/context/ChatContext.tsx`
- `features/chat/utils/chatStorage.ts` — mock local con AsyncStorage

**Estado global via `useChat()` (importado de `features/chat/hooks/useChat.ts`):**

| Método                                        | Descripción                             |
| --------------------------------------------- | --------------------------------------- |
| `conversations`                               | Lista de conversaciones del usuario     |
| `fetchConversations()`                        | Carga lista                             |
| `getMessages(convId)`                         | Mensajes de una conversación            |
| `sendMessage(convId, text)`                   | Envía mensaje                           |
| `markAsRead(convId)`                          | Marca conversación como leída           |
| `getOrCreateConversation(dto)`                | Abre o crea conversación con un usuario |
| `updateConversationLastMessage(convId, text)` | Actualiza vista de la lista sin refetch |

**Modo mock:** En desarrollo, el chat usa `chatStorage.ts` (AsyncStorage) con datos seed. No se hacen peticiones HTTP. El backend se conectará cuando `EXPO_PUBLIC_USE_MOCK=false`.

**WebSocket:** La API REST está preparada pero el WebSocket **no está implementado todavía**. Ver sección 8.7 para cómo añadirlo.

---

### 4.5 Weather (Clima)

**Archivos relevantes:**

- `features/weather/api/weatherApi.ts` — llamadas a OpenWeatherMap
- `features/weather/context/weatherContext.tsx`
- `features/weather/hooks/useWeather.ts`
- `features/weather/hooks/useWeatherLocation.ts`

**Fuente de datos:** OpenWeatherMap API v2.5 (externa, no pasa por el backend NestJS). Requiere `EXPO_PUBLIC_OWM_KEY`.

**Estado global via `useWeather()`:**

| Propiedad / Método               | Descripción                                                 |
| -------------------------------- | ----------------------------------------------------------- |
| `weatherData`                    | `WeatherData \| null` — current + forecast 5 días + alertas |
| `currentCity`                    | Nombre de la ciudad activa                                  |
| `loading`, `error`               | Estado de la petición                                       |
| `fetchWeatherByCity(city)`       | Busca por nombre de ciudad                                  |
| `fetchWeatherByCoords(lat, lon)` | Busca por GPS                                               |
| `clearError()`                   | Limpia el error                                             |

**Hook de localización `useWeatherLocation()`:**

```typescript
const { locating, locationError, requestLocation } = useWeatherLocation();
// requestLocation() → pide permiso GPS → llama fetchWeatherByCoords
```

---

## 5. Sistema de estilos

Todo el diseño parte de `src/styles/Globaltheme.ts`. Nunca usar colores o espaciados hardcodeados.

```typescript
import {
  colors,
  shared,
  spacing,
  font,
  radius,
} from "../../styles/Globaltheme";
```

| Token                                         | Ejemplos de uso                     |
| --------------------------------------------- | ----------------------------------- |
| `colors.primary`                              | Verde principal de la app           |
| `colors.primaryDim`                           | Fondo de chips/badges activos       |
| `colors.error`                                | Rojo para errores                   |
| `colors.textPrimary / textSecond / textMuted` | Jerarquía de texto                  |
| `colors.surface / surfaceAlt / bg`            | Fondos de tarjetas e inputs         |
| `spacing.xs/sm/md/lg/xl/xxl/xxxl`             | Márgenes y paddings consistentes    |
| `font.xs/sm/md/lg/xl/xxl`                     | Tamaños de fuente                   |
| `radius.sm/md/lg/full`                        | Bordes redondeados                  |
| `shared.screen`                               | Estilo base de toda pantalla        |
| `shared.card`                                 | Tarjeta con sombra y padding        |
| `shared.input`                                | Input estándar                      |
| `shared.btnPrimary / btnPrimaryText`          | Botón primario verde                |
| `shared.btnOutline / btnOutlineText`          | Botón secundario con borde          |
| `shared.sectionTitle`                         | Título de sección dentro de tarjeta |

**Archivos de estilos específicos (candidatos a eliminar):**

- `styles/crops/newCrop.style.ts` — **redundante** desde que `NewCropScreen` usa `StyleSheet` inline + `Globaltheme`
- `styles/crops/newTasks.style.ts` — `NewTask.tsx` puede haberlo internalizado también

---

## 6. Variables de entorno

Crear `.env` en la raíz del proyecto:

```env
# URL base del backend NestJS
EXPO_PUBLIC_API_URL=http://192.168.1.X:3000

# API Key de OpenWeatherMap (cuenta gratuita en openweathermap.org)
EXPO_PUBLIC_OWM_KEY=tu_api_key_aqui

# Activar datos de prueba sin backend (true en desarrollo, false en producción)
EXPO_PUBLIC_USE_MOCK=true
```

> Para probar en dispositivo físico, usa la IP local de tu máquina (no `localhost`).

---

## 7. Limpieza recomendada

### Archivos a eliminar

| Archivo                                                 | Motivo                                                                                                                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/products/utils/tokenStorage.ts`               | **Duplicado exacto** de `features/auth/utils/tokenStorage.ts`. Todos los `import { getToken }` en products deben apuntar a `../../auth/utils/tokenStorage` |
| `features/crops/hooks/useTaks.ts`                       | Typo en el nombre + funcionalidad completamente cubierta por `useCrops()`. Solo tiene un wrapper de `createTaskRequest` que ni siquiera usa el contexto    |
| `styles/crops/newCrop.style.ts`                         | `NewCropScreen` ya define sus propios estilos inline con `StyleSheet.create`. Este archivo ya no se importa en ningún sitio                                |
| `navigation/MainStack.tsx` (línea del import duplicado) | Tiene `import NewCropScreen` dos veces y `import DetailCorpScreen` con nombre incorrecto — ya corregido en versión anterior                                |

### Cambios de nombre recomendados

| Actual                                        | Correcto             | Motivo                                                |
| --------------------------------------------- | -------------------- | ----------------------------------------------------- |
| `features/crops/hooks/useTaks.ts`             | Eliminar             | Ver arriba                                            |
| `features/weather/context/weatherContext.tsx` | `WeatherContext.tsx` | Inconsistencia de mayúscula con el resto de contextos |

### Import a corregir en `productsApi.ts`

```typescript
// ❌ Actual (apunta a un duplicado)
import { getToken } from "../../auth/utils/tokenStorage";

// ✅ Correcto (fuente única)
// Ya apunta al correcto — verificar que NO importa del utils local de products
```

### Registro duplicado en `MainStack.tsx`

```typescript
// ❌ Líneas a eliminar del MainStack actual
import DetailCorpScreen from "../screens/crops/DetailCropScreen"; // nombre incorrecto
import NewCorpScreen from "../screens/crops/NewCropScreen"; // duplicado con typo

// ✅ Dejar solo estas
import DetailCropScreen from "../screens/crops/DetailCropScreen";
import NewCropScreen from "../screens/crops/NewCropScreen";
```

### `ConfiguracionScreen` huérfana

`navigation.ts` declara `ConfiguracionScreen: undefined` en `RootStackParamList` pero no existe ninguna pantalla ni Stack.Screen con ese nombre. Eliminar la entrada del tipo o crear la pantalla.

---

## 8. Conexión al backend NestJS

### 8.1 Configuración base

El frontend ya está preparado. Solo necesitas:

1. Arrancar el servidor NestJS
2. Actualizar `.env` con la IP correcta
3. Cambiar `EXPO_PUBLIC_USE_MOCK=false`

La URL base se lee en cada archivo `api.ts`:

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL; // "http://192.168.1.X:3000"
```

Todas las peticiones autenticadas inyectan el JWT automáticamente:

```typescript
const authHeaders = async (): Promise<HeadersInit> => {
  const token = await getToken(); // AsyncStorage
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
```

---

### 8.2 Auth endpoints

| Método  | Ruta                    | Descripción                    | Autenticado |
| ------- | ----------------------- | ------------------------------ | ----------- |
| `POST`  | `/auth/login`           | Login                          | No          |
| `POST`  | `/auth/register`        | Registro                       | No          |
| `GET`   | `/auth/me`              | Perfil del usuario autenticado | Sí          |
| `PATCH` | `/auth/profile`         | Actualizar perfil              | Sí          |
| `POST`  | `/auth/change-password` | Cambiar contraseña             | Sí          |

**`POST /auth/login`**

```json
// Request
{ "email": "user@example.com", "password": "123456" }

// Response
{ "accessToken": "eyJ...", "user": { "id": 1, "email": "...", "nombre": "Juan", "rol": "Agricultor" } }
```

**`POST /auth/register`**

```json
// Request
{ "email": "user@example.com", "password": "123456", "nombre": "Juan García", "telefono": "+34600000000" }

// Response — misma estructura que login
{ "accessToken": "eyJ...", "user": { ... } }
```

**`PATCH /auth/profile`**

```json
// Request (campos opcionales)
{ "nombre": "Juan García", "telefono": "+34 600 000 001", "rol": "Agricultor" }

// Response — objeto User actualizado
```

**`POST /auth/change-password`**

```json
// Request
{ "current_password": "vieja", "new_password": "nueva" }

// Response — 200 OK sin body, o { "message": "Password changed" }
```

**NestJS — estructura de módulo recomendada:**

```typescript
// auth.module.ts
@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '7d' } }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}

// auth.controller.ts
@Post('login')
login(@Body() dto: LoginDto) { ... }

@Post('register')
register(@Body() dto: RegisterDto) { ... }

@Get('me')
@UseGuards(JwtAuthGuard)
getMe(@Request() req) { return req.user; }

@Patch('profile')
@UseGuards(JwtAuthGuard)
updateProfile(@Request() req, @Body() dto: UpdateProfileDto) { ... }

@Post('change-password')
@UseGuards(JwtAuthGuard)
changePassword(@Request() req, @Body() dto: ChangePasswordDto) { ... }
```

---

### 8.3 Crops endpoints

| Método   | Ruta                  | Descripción                    | Autenticado |
| -------- | --------------------- | ------------------------------ | ----------- |
| `GET`    | `/crops`              | Todos los cultivos del usuario | Sí          |
| `GET`    | `/crops/:id`          | Cultivo por ID                 | Sí          |
| `POST`   | `/crops`              | Crear cultivo                  | Sí          |
| `PATCH`  | `/crops/:id`          | Actualizar cultivo             | Sí          |
| `DELETE` | `/crops/:id`          | Eliminar cultivo               | Sí          |
| `GET`    | `/crops/parcels/list` | Parcelas disponibles           | Sí          |

**`POST /crops`**

```json
// Request (campos que envía el frontend)
{
  "nombre": "Tomate",
  "variedad": "Cherry",
  "tipo_cultivo": "Hortalizas",
  "parcela_id": 1,
  "superficie": 0.5,
  "fecha_siembra": "2026-05-19",
  "notas": "Riego cada 2 días",
  "fase_actual": "Plántula",
  "dias_riego": 2,
  "dias_fertilizacion": 7
}

// Response — objeto cultivo completo
{
  "id": 1,
  "nombre": "Tomate",
  "variedad": "Cherry",
  "tipo_cultivo": "Hortalizas",
  "parcela_id": 1,
  "parcela_nombre": "Parcela Norte",
  "superficie": "0.5",
  "fecha_siembra": "2026-05-19",
  "fase_actual": "Plántula",
  "status": "active",
  "tareas_count": 0,
  "fecha_creacion": "2026-05-19T10:00:00Z",
  "updatedAt": "2026-05-19T10:00:00Z"
}
```

**`GET /crops/parcels/list`**

```json
// Response
[
  {
    "id": 1,
    "nombre": "Parcela Norte",
    "ubicacion": "Sector A",
    "tamano": "1.20"
  },
  {
    "id": 2,
    "nombre": "Parcela Sur",
    "ubicacion": "Sector B",
    "tamano": "0.80"
  }
]
```

**NestJS — entidad Crop recomendada:**

```typescript
@Entity("cultivos")
export class Crop {
  @PrimaryGeneratedColumn() id: number;
  @Column() nombre: string;
  @Column() variedad: string;
  @Column() tipo_cultivo: string;
  @Column() parcela_id: number;
  @Column("decimal", { precision: 6, scale: 2 }) superficie: number;
  @Column({ type: "date" }) fecha_siembra: string;
  @Column({ default: "Plántula" }) fase_actual: string;
  @Column({ nullable: true }) fecha_cosecha_esperada: string;
  @Column({ nullable: true }) notas: string;
  @Column({ default: "active" }) status: string;
  @Column({ default: 2 }) dias_riego: number;
  @Column({ default: 7 }) dias_fertilizacion: number;
  @ManyToOne(() => User) usuario: User;
  @CreateDateColumn({ name: "fecha_creacion" }) createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

---

### 8.4 Tasks endpoints

| Método   | Ruta                                | Descripción                       |
| -------- | ----------------------------------- | --------------------------------- |
| `GET`    | `/tasks/crop/:cropId`               | Tareas de un cultivo              |
| `GET`    | `/tasks/crop/:cropId/pending-count` | Número de tareas pendientes       |
| `POST`   | `/tasks`                            | Crear tarea                       |
| `PATCH`  | `/tasks/:id`                        | Actualizar tarea (estado, campos) |
| `DELETE` | `/tasks/:id`                        | Eliminar tarea                    |

**`POST /tasks`**

```json
// Request
{
  "cultivo_id": 1,
  "tipo": "Riego",
  "fecha": "15/05/2026",
  "hora": "08:00",
  "descripcion": "Riego por goteo",
  "cantidad": 20,
  "unidad": "Litros"
}

// Response
{
  "id": 1,
  "cultivo_id": 1,
  "tipo": "Riego",
  "fecha": "15/05/2026",
  "hora": "08:00",
  "descripcion": "Riego por goteo",
  "cantidad": 20,
  "unidad": "Litros",
  "status": "pendiente",
  "fecha_creacion": "2026-05-14T10:00:00Z"
}
```

**`PATCH /tasks/:id`** — para toggle de estado:

```json
// Request
{ "status": "completada" }
// Response — tarea actualizada completa
```

---

### 8.5 Products endpoints

| Método   | Ruta             | Descripción                         |
| -------- | ---------------- | ----------------------------------- |
| `GET`    | `/products`      | Todos los productos del marketplace |
| `GET`    | `/products/:id`  | Producto por ID                     |
| `GET`    | `/products/mine` | Mis anuncios                        |
| `POST`   | `/products`      | Publicar producto                   |
| `PATCH`  | `/products/:id`  | Editar anuncio                      |
| `DELETE` | `/products/:id`  | Eliminar anuncio                    |

**`POST /products`**

```json
// Request
{
  "nombre": "Semilla tomate cherry",
  "categoria": "Semillas",
  "precio": 12.5,
  "unidad": "€/kg",
  "stock": 50,
  "descripcion": "Semillas de alta calidad...",
  "provincia": "Málaga"
}

// Response — objeto Product con seller resuelto
{
  "id": "p1",
  "name": "Semilla tomate cherry",
  "category": "Semillas",
  "price": 12.5,
  "unit": "€/kg",
  "stock": 50,
  "description": "...",
  "location": "Málaga",
  "province": "Málaga",
  "seller": {
    "id": "u1",
    "name": "Juan García",
    "initials": "JG",
    "rating": 0,
    "sales": 0,
    "location": "Málaga"
  },
  "images": [],
  "createdAt": "2026-05-19"
}
```

> El frontend no hace mapeo de productos — espera directamente los campos en camelCase inglés. El backend debe devolver el objeto con esa estructura, o añadir un mapper en `productsApi.ts`.

---

### 8.6 Chat endpoints

| Método  | Ruta                          | Descripción                         |
| ------- | ----------------------------- | ----------------------------------- |
| `GET`   | `/conversations`              | Lista de conversaciones del usuario |
| `POST`  | `/conversations`              | Crear o recuperar conversación      |
| `PATCH` | `/conversations/:id/read`     | Marcar como leída                   |
| `GET`   | `/conversations/:id/messages` | Mensajes de una conversación        |
| `POST`  | `/conversations/:id/messages` | Enviar mensaje                      |

**`POST /conversations`**

```json
// Request
{
  "participant_id": "u2",
  "participant_name": "AgroMar",
  "participant_initials": "AM"
}
// Response — conversación (existente o nueva)
```

**`POST /conversations/:id/messages`**

```json
// Request
{ "text": "Hola, ¿tienes stock de semillas?" }

// Response
{
  "id": "m_123",
  "senderId": "u1",
  "text": "Hola, ¿tienes stock de semillas?",
  "timestamp": "2026-05-19T10:30:00Z",
  "read": true
}
```

---

### 8.7 WebSocket (Chat en tiempo real)

El chat actual es REST puro. Para añadir WebSocket con `@nestjs/platform-socket.io`:

**Backend NestJS:**

```typescript
// chat.gateway.ts
@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage("joinRoom")
  handleJoin(client: Socket, convId: string) {
    client.join(convId);
  }

  @SubscribeMessage("sendMessage")
  async handleMessage(
    client: Socket,
    payload: { convId: string; text: string },
  ) {
    const msg = await this.chatService.saveMessage(payload);
    this.server.to(payload.convId).emit("newMessage", msg);
  }
}
```

**Frontend — añadir en `ChatContext.tsx`:**

```typescript
import { io, Socket } from "socket.io-client";

// En el Provider
const socketRef = useRef<Socket | null>(null);

useEffect(() => {
  const token = await getToken();
  socketRef.current = io(process.env.EXPO_PUBLIC_API_URL, {
    auth: { token },
    transports: ["websocket"],
  });

  socketRef.current.on("newMessage", (msg: ChatMessage) => {
    // Actualizar mensajes en tiempo real
  });

  return () => {
    socketRef.current?.disconnect();
  };
}, []);

// Al abrir una conversación
const joinRoom = (convId: string) => {
  socketRef.current?.emit("joinRoom", convId);
};
```

Paquete necesario: `npm install socket.io-client`

---

### 8.8 Eliminar el modo mock

Cuando el backend esté listo, desactivar el mock **en cada contexto**:

1. En `.env`: `EXPO_PUBLIC_USE_MOCK=false`
2. Verificar que `isDev()` retorna `false` — todos los contextos usan:
   ```typescript
   const isDev = () => __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK === "true";
   ```
3. Los bloques `if (isDev()) { ... }` pueden eliminarse después para limpiar el código

**Checklist de verificación antes de ir a producción:**

- [ ] `EXPO_PUBLIC_USE_MOCK=false`
- [ ] `EXPO_PUBLIC_API_URL` apunta al servidor de producción (HTTPS)
- [ ] `EXPO_PUBLIC_OWM_KEY` tiene una clave válida
- [ ] Eliminar `devLogin()` del contexto y del `LoginScreen`
- [ ] Eliminar los bloques mock de `CropsContext`, `ProductsContext`, `ChatContext`
- [ ] Eliminar `chatStorage.ts` si el backend de chat está operativo
- [ ] Eliminar `styles/crops/newCrop.style.ts` (sin importadores)
- [ ] Eliminar `features/crops/hooks/useTaks.ts` (typo + obsoleto)
- [ ] Eliminar `features/products/utils/tokenStorage.ts` (duplicado)
- [ ] Corregir el `MainStack.tsx` con los imports dobles de Corp/Crop
- [ ] Eliminar `ConfiguracionScreen` de `navigation.ts` o crear la pantalla
