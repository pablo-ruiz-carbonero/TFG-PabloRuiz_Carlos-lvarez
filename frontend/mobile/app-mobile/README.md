# Frontend Mobile - AgroLink

## 📱 Descripción General

Esta es una aplicación móvil React Native para la gestión agrícola integral. Permite a los agricultores gestionar sus cultivos, tareas, clima, mercado y comunicaciones desde un dispositivo móvil. La aplicación está diseñada con una interfaz blanca y verde coherente, enfocada en la usabilidad y eficiencia para usuarios agrícolas.

### 🎯 Funcionalidades Principales

- **Gestión de Cultivos**: CRUD completo de cultivos con seguimiento de fases, parcelas y métricas
- **Sistema de Tareas**: Gestión de tareas agrícolas por cultivo
- **Información Climática**: Datos meteorológicos relevantes para la agricultura
- **Mercado**: Plataforma de comercio agrícola
- **Mensajería**: Comunicación entre usuarios
- **Autenticación**: Sistema de login/registro con persistencia de sesión

## 🏗️ Arquitectura de la Aplicación

### Estructura de Carpetas

```
src/
├── components/          # Componentes reutilizables
├── context/            # Contextos de React (Auth)
├── navigation/         # Configuración de navegación
├── screens/            # Pantallas principales
├── services/           # Servicios de API
├── styles/             # Estilos y tema
└── types/              # Definiciones TypeScript
```

## 📋 Descripción de Clases/Componentes

### 🖥️ Pantallas (Screens)

#### `App.tsx`
**Propósito**: Punto de entrada principal de la aplicación.
- Configura el `SafeAreaProvider` para compatibilidad con dispositivos con notch
- Envuelve la aplicación en `NavigationContainer` para navegación
- Renderiza `RootNavigator` como componente raíz

#### `AuthLoader.tsx`
**Propósito**: Pantalla de carga durante la verificación de autenticación.
- Muestra un indicador de carga mientras se verifica el token de usuario
- Redirige automáticamente a login o aplicación principal

#### `LoginScreen.tsx`
**Propósito**: Pantalla de inicio de sesión.
- Formulario de email y contraseña
- Validación de campos requeridos
- Integración con `authService` para autenticación
- Navegación a registro o aplicación principal

#### `RegisterScreen.tsx`
**Propósito**: Pantalla de registro de nuevos usuarios.
- Formulario con campos: nombre, email, contraseña, confirmación
- Validación robusta de formularios
- Integración con `authService` para registro

#### `HomeScreen.tsx`
**Propósito**: Pantalla principal/dashboard.
- Muestra resumen general de la finca
- Accesos rápidos a funciones principales
- Información destacada (clima, tareas pendientes, etc.)

#### `CropsScreen.tsx`
**Propósito**: Lista principal de cultivos.
- **Funcionalidades**:
  - Lista de cultivos con `FlatList`
  - Búsqueda y filtrado por nombre/variedad
  - Estados de carga con `ActivityIndicator`
  - Pantalla vacía con llamada a acción
  - Actualización automática al enfocar (`useFocusEffect`)
  - Navegación a detalles de cultivo
- **Estados**: `crops`, `filteredCrops`, `pendingCounts`, `searchQuery`, `loading`
- **Métodos**: `loadCrops()`, `handleSearch()`, `renderCropCard()`

#### `NewCorpScreen.tsx` (Crear Cultivo)
**Propósito**: Formulario para crear nuevos cultivos.
- **Campos del formulario**:
  - Nombre del cultivo
  - Variedad
  - Tipo de cultivo (selector)
  - Parcela (selector con datos en tiempo real)
  - Superficie (hectáreas, decimal)
  - Fecha de siembra (YYYY-MM-DD)
  - Notas (opcional)
- **Validación**: Campos requeridos, formato de fecha, valores numéricos
- **Integración**: `cropsService.createCrop()`, `cropsService.getParcels()`

#### `DetailCorpScreen.tsx`
**Propósito**: Vista detallada de un cultivo específico.
- **Secciones**:
  - Información básica (nombre, variedad, parcela)
  - Cuadrícula de métricas (edad, tareas pendientes, superficie)
  - Fechas importantes (siembra, cosecha esperada)
  - Riego (último, frecuencia, botón registrar)
  - Fertilización (último, frecuencia, botón registrar)
  - Producción esperada
  - Notas del cultivo
- **Funcionalidades**: Eliminar cultivo con confirmación

#### `WeatherScreen.tsx`
**Propósito**: Información meteorológica.
- Datos climáticos actuales y pronóstico
- Información relevante para decisiones agrícolas

#### `MarketplaceScreen.tsx`
**Propósito**: Plataforma de comercio agrícola.
- Lista de productos disponibles
- Funcionalidades de compra/venta

#### `ProfileScreen.tsx`
**Propósito**: Perfil del usuario.
- Información personal
- Configuración de la aplicación

#### `NewTask.tsx`
**Propósito**: Crear nuevas tareas agrícolas.
- Formulario para asignar tareas a cultivos específicos

#### `ChatListScreen.tsx`
**Propósito**: Lista de conversaciones.
- Mensajes entre usuarios
- Sistema de chat integrado

### 🧩 Componentes (Components)

#### `CropCard.tsx`
**Propósito**: Componente reutilizable para mostrar cultivos en listas.
- **Props**: `crop: Crop`, `onPress: (cropId: string) => void`
- **Elementos**:
  - Nombre y variedad del cultivo
  - Badge con fase actual
  - Información: edad, parcela, número de tareas
- **Estilos**: Tarjeta con borde izquierdo verde, diseño compacto

#### `WeatherCard.tsx`
**Propósito**: Componente para mostrar información climática.
- Datos meteorológicos formateados
- Iconos representativos del clima

#### `PerfilMenu.tsx`
**Propósito**: Menú de opciones del perfil.
- Lista de acciones disponibles en el perfil

#### `Divider.tsx`
**Propósito**: Componente separador visual.
- Línea divisoria consistente con el tema

### 🔧 Servicios (Services)

#### `authService.ts`
**Propósito**: Manejo de autenticación y usuarios.
- **Métodos**:
  - `login(email, password)`: Autenticación de usuario
  - `register(userData)`: Registro de nuevos usuarios
  - `logout()`: Cierre de sesión
  - `getCurrentUser()`: Obtener datos del usuario actual

#### `cropsService.ts`
**Propósito**: API para gestión de cultivos.
- **Métodos principales**:
  - `getAllCrops()`: Obtener todos los cultivos
  - `getCropById(cropId)`: Obtener cultivo específico
  - `createCrop(data)`: Crear nuevo cultivo
  - `updateCrop(cropId, data)`: Actualizar cultivo
  - `deleteCrop(cropId)`: Eliminar cultivo
  - `getParcels()`: Obtener lista de parcelas
- **Características**: Actualmente usa datos mock, preparado para backend

#### `tasksService.ts`
**Propósito**: Gestión de tareas agrícolas.
- **Métodos**:
  - `getPendingCount(cropId)`: Contar tareas pendientes por cultivo
  - `getTasksByCrop(cropId)`: Obtener tareas de un cultivo
  - `createTask(data)`: Crear nueva tarea
  - `updateTask(taskId, data)`: Actualizar tarea
  - `deleteTask(taskId)`: Eliminar tarea

### 🎨 Estilos y Tema (`theme.ts`)

**Propósito**: Sistema de diseño centralizado con tokens consistentes.

#### Colores (`colors`)
- **Marca**: Verde primario (`#2E7D32`) para CTAs y títulos
- **Superficies**: Blanco y tonos off-white para fondos
- **Texto**: Jerarquía clara (primary, secondary, muted)
- **Semánticos**: Success, warning, error, info
- **Badges**: Colores específicos para estados

#### Espaciados (`spacing`)
- Escala consistente: `xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `xxl: 24`

#### Fuentes (`font`)
- Tamaños: `xs: 12`, `sm: 14`, `md: 16`, `lg: 18`, `xl: 20`, `xxl: 24`
- Pesos: `regular: 400`, `medium: 500`, `bold: 600`

#### Radios (`radius`)
- Bordes redondeados: `sm: 4`, `md: 8`, `lg: 12`, `xl: 16`

#### Estilos Compartidos (`shared`)
- Componentes comunes: botones, inputs, tarjetas, navegación

### 🧭 Navegación

#### `AppNavigator.tsx` (Root Navigator)
**Propósito**: Navegador raíz con lógica de autenticación.
- **Stack Navigator** con `@react-navigation/native-stack`
- **Lógica de autenticación**:
  - Verifica token en AsyncStorage
  - Recarga periódica cada 800ms para mantener sesión actualizada
  - Pantallas condicionales: autenticado → `BottomNav`, no autenticado → Login/Register
- **Pantallas stack**: Main, Profile, NewCorp, Crops, DetailCorp, NewTask, ChatList, Weather

#### `BottomNav.tsx`
**Propósito**: Navegación por pestañas inferior.
- **Bottom Tab Navigator** con 4 pestañas:
  - **Inicio**: `HomeScreen`
  - **Cultivos**: `CropsScreen`
  - **Mercado**: `MarketplaceScreen`
  - **Mensajes**: `ChatListScreen`
- **Estilos**: Tema consistente, iconos y labels personalizados

#### `StackNavigator.tsx`
**Propósito**: Navegación en pila para pantallas modales/detalles.

#### `TabNavigator.tsx`
**Propósito**: Navegación por pestañas adicional.

### 📝 Tipos TypeScript

#### `crops.ts`
- **`Crop`**: Interfaz completa con todos los campos de un cultivo
- **`CreateCropRequest`**: Datos para crear cultivo
- **`UpdateCropRequest`**: Datos para actualizar cultivo
- **`Parcel`**: Información de parcelas/campos

#### `auth.ts`
- **`User`**: Datos del usuario
- **`LoginRequest`**: Credenciales de login
- **`RegisterRequest`**: Datos de registro

#### `navigation.ts`
- **`RootStackParamList`**: Parámetros de navegación para todas las pantallas

#### `tasks.ts`
- **`Task`**: Estructura de tareas agrícolas

#### `user.ts`
- **`UserProfile`**: Perfil extendido del usuario

### 🔐 Contextos

#### `AuthContext.tsx`
**Propósito**: Gestión global del estado de autenticación.
- **Estado**: `user`, `token`, `loading`
- **Métodos**: `login()`, `logout()`, `register()`
- **Persistencia**: AsyncStorage para token

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 16+
- npm o yarn
- React Native CLI
- Android Studio (para Android) o Xcode (para iOS)

### Instalación
```bash
cd frontend/mobile/app-mobile
npm install
```

### Ejecución
```bash
# Para Android
npm run android

# Para iOS
npm run ios

# Para Expo (si aplica)
npm start
```

## 🔗 Integración con Backend

La aplicación está preparada para conectarse con un backend REST API. Los servicios incluyen:

- URLs configurables en `API_BASE_URL`
- Llamadas fetch comentadas listas para activar
- Manejo de errores consistente
- Datos mock para desarrollo

### Endpoints Esperados
- `GET /api/crops` - Lista de cultivos
- `POST /api/crops` - Crear cultivo
- `PUT /api/crops/:id` - Actualizar cultivo
- `DELETE /api/crops/:id` - Eliminar cultivo
- `GET /api/parcels` - Lista de parcelas
- `GET /api/tasks` - Lista de tareas

## 📊 Estados y Ciclo de Vida

### Estados de Cultivos
- `active`: Cultivo en producción
- `completed`: Cosechado/finalizado
- `archived`: Archivado

### Fases de Cultivos
- Plántula
- Crecimiento
- Floración
- Fructificación
- Cosecha

### Estados de Tareas
- Pendiente
- En progreso
- Completada
- Cancelada

## 🎨 Diseño y UX

### Principios de Diseño
- **Minimalista**: Interfaz limpia con enfoque en contenido
- **Consistente**: Tema unificado en toda la aplicación
- **Accesible**: Contraste adecuado, tamaños de toque mínimos
- **Responsive**: Adaptable a diferentes tamaños de pantalla

### Paleta de Colores
- **Primario**: Verde agrícola (#2E7D32)
- **Fondos**: Blanco y tonos neutros
- **Texto**: Jerarquía clara con colores apropiados

## 🧪 Testing y Desarrollo

### Datos Mock
La aplicación incluye datos de ejemplo para desarrollo:
- 3 cultivos de muestra (Tomate, Pimiento, Lechuga)
- Parcelas predefinidas
- Tareas de ejemplo

### Validación
- TypeScript estricto en toda la aplicación
- Validación de formularios robusta
- Manejo de errores consistente

## 📈 Próximas Funcionalidades

- Edición de cultivos existentes
- Sistema de imágenes para cultivos
- Notificaciones push
- Reportes y análisis
- Integración con sensores IoT
- Modo offline
- Sincronización en tiempo real

---

**Nota**: Esta documentación está diseñada para proporcionar una comprensión completa de la arquitectura y funcionalidad de la aplicación móvil. Cada componente y servicio está documentado con su propósito, estructura y relaciones con otros elementos del sistema.