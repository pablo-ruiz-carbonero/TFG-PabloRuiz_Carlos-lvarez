// QUICK START GUIDE - Sistema de Cultivos

## 🎯 Empezar Rápido

### 1. Ver los cultivos (sin backend)

La app viene lista con datos de ejemplo:

```bash
npm start
# Selecciona "i" para iOS o "a" para Android
# Toca "Cultivos" en la navegación inferior
```

Verás 3 cultivos de ejemplo:
- Tomate Cherry (45 días)
- Pimiento Rojo (74 días) 
- Lechuga (24 días)

### 2. Crear un cultivo

- Toca "+ Nuevo"
- Completa el formulario
- Toca "Guardar cultivo"
- El cultivo aparece en la lista

### 3. Ver detalles

- Toca un cultivo en la lista
- Ves toda la información
- Puedes eliminar con el botón "Eliminar"

### 4. Buscar cultivos

En la pantalla de cultivos, usa la barra de búsqueda para filtrar por:
- Nombre del cultivo
- Variedad

## 📚 Estructura de Carpetas

```
src/
├── screens/
│   ├── CropsScreen.tsx          # Lista de cultivos
│   ├── NewCorpScreen.tsx        # Crear cultivo
│   ├── DetailCorpScreen.tsx     # Ver detalles
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── HomeScreen.tsx
│   ├── WeatherScreen.tsx
│   ├── ProfileScreen.tsx
│   └── AuthLoader.tsx
│
├── components/
│   ├── CropCard.tsx             # Tarjeta de cultivo
│   ├── WeatherCard.tsx
│   ├── PerfilMenu.tsx
│   └── Divider.tsx
│
├── services/
│   ├── cropsService.ts          # API de cultivos
│   └── authService.ts
│
├── types/
│   ├── crops.ts                 # Tipos de cultivos
│   ├── auth.ts
│   ├── navigation.ts
│   └── user.ts
│
├── styles/
│   └── theme.ts                 # Estilos globales
│
├── context/
│   └── AuthContext.tsx
│
└── navigation/
    ├── AppNavigator.tsx         # Navegación principal
    ├── BottomNav.tsx
    ├── StackNavigator.tsx
    └── TabNavigator.tsx
```

## 🔄 Datos Mock

Los cultivos de ejemplo están en `src/services/cropsService.ts`:

```typescript
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
    // ... más datos
  },
  // Más cultivos...
];
```

Para cambiar los datos de ejemplo, edita esta constante.

## 🔌 Conectar Backend

Lee `BACKEND_INTEGRATION.md` para instrucciones detalladas.

Resumen rápido:
1. Cambia `API_BASE_URL` en `cropsService.ts`
2. Descomenta las llamadas `fetch()`
3. Implementa los endpoints en tu backend

## 📱 Pantallas Principales

### CropsScreen
```
┌─────────────────────────┐
│  Mis Cultivos    + Nuevo│
├─────────────────────────┤
│ [Buscar cultivo...]     │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Tomate Cherry   [En]│ │
│ │ Sweet 100       plá │
│ │ 45d • Parcela A1    │ │
│ │ 3 tareas        →   │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Pimiento Rojo   [Cr]│ │
│ │ California      ecy │ │
│ │ 74d • Parcela B1    │ │
│ │ 2 tareas        →   │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Lechuga         [Cr]│ │
│ │ Iceberg         ecy │ │
│ │ 24d • Parcela A2    │ │
│ │ 1 tarea         →   │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### DetailCorpScreen
```
┌──────────────────────────┐
│ ← Volver    [En plántano]│
├──────────────────────────┤
│  Tomate Cherry           │
│  Sweet 100               │
│  [Hortalizas]            │
├──────────────────────────┤
│ ┌──┬──┬──┐                │
│ │45│ 3│0.│                │
│ │d │  │5│                │
│ │ed│ts│ha│                │
│ └──┴──┴──┘                │
├──────────────────────────┤
│ 📅 Fechas importantes     │
│ Siembra: 12 marzo 2026   │
│ Cosecha: 12 junio 2026   │
├──────────────────────────┤
│ 💧 Riego                  │
│ Último: 4 may, 14:32     │
│ Cada 2 días              │
│ [Registrar riego]        │
├──────────────────────────┤
│ 🌱 Fertilización          │
│ Última: 1 may            │
│ Cada 7 días              │
│ [Registrar fertilización]│
├──────────────────────────┤
│ [Volver]     [Eliminar]  │
└──────────────────────────┘
```

### NewCorpScreen
```
┌──────────────────────────┐
│ Nuevo Cultivo            │
│ Completa los datos       │
├──────────────────────────┤
│ Nombre del cultivo       │
│ [Ej: Tomate, Pimiento...│
│                          │
│ Variedad                 │
│ [Ej: Cherry...]          │
│                          │
│ Tipo de cultivo          │
│ [Hortalizas ▼]           │
│                          │
│ Parcela                  │
│ [Parcela A1 (1.2 ha) ▼] │
│                          │
│ Superficie (ha)          │
│ [0.5                     │
│                          │
│ Fecha de siembra         │
│ [2026-05-04              │
│ Formato: 2026-05-04      │
│                          │
│ Notas (opcional)         │
│ [Notas adicionales...    │
│                          │
│ [Cancelar] [Guardar]     │
└──────────────────────────┘
```

## 🎨 Colores y Estilos

El sistema usa estos colores principales:

```typescript
colors.primary = "#22B14C"      // Verde principal
colors.primaryLight = "#E8F5E9" // Verde claro
colors.white = "#FFFFFF"
colors.surface = "#F5F5F5"      // Gris claro
colors.bg = "#FAFAFA"           // Fondo general
colors.textPrimary = "#212121"  // Texto oscuro
colors.textSecond = "#666666"   // Texto gris
colors.textMuted = "#999999"    // Texto muy gris
colors.border = "#E0E0E0"       // Bordes
```

## 📞 Soporte Técnico

### Preguntas frecuentes

**P: ¿Cómo agrego más campos al cultivo?**
R: Edita la interfaz `Crop` en `src/types/crops.ts`

**P: ¿Cómo cambio los colores?**
R: Edita `src/styles/theme.ts`

**P: ¿Cómo agrego validación adicional?**
R: Edita la función `validateForm()` en `NewCorpScreen.tsx`

**P: ¿Cómo conecto con mi backend?**
R: Lee `BACKEND_INTEGRATION.md`

## 🚀 Próximos Pasos

1. **Conecta tu backend** - Sigue `BACKEND_INTEGRATION.md`
2. **Agrega fotos** - Usa `react-native-image-picker`
3. **Implementa edición** - Crea `EditCorpScreen.tsx`
4. **Agrega tareas** - Crea sistema de task management
5. **Notificaciones** - Usa `expo-notifications` para recordatorios
6. **Gráficos** - Muestra progreso del cultivo
