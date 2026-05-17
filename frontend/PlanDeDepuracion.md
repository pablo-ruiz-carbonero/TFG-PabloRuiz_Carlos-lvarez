# 🌱 AgroLink — Plan de Desarrollo y Depuración
**TFG · Pablo Ruiz & Carlos Álvarez**  
*Generado tras análisis completo del código fuente*

---

## 🔴 BUGS CRÍTICOS (rompen la app ahora mismo)

### 1. `ChatScreen` importado desde `WeatherScreen` en `AppNavigator`
**Archivo:** `src/navigation/AppNavigator.tsx`  
**Problema:** El stack registra `ChatScreen` con el componente de `WeatherScreen`. Pulsar "Contactar vendedor" o abrir un chat abre la pantalla del clima.
```tsx
// ❌ INCORRECTO (línea actual)
import ChatScreen from "../screens/WeatherScreen";

// ✅ CORRECTO
import ChatScreen from "../screens/ChatScreen";
```

---

### 2. `LoginScreen` no navega tras hacer login
**Archivo:** `src/screens/LoginScreen.tsx`  
**Problema:** Tras el login exitoso solo guarda el token en AsyncStorage pero no llama a ninguna navegación. El `AppNavigator` refresca mediante `setInterval` cada 800ms, lo que causa un flash y es frágil. Si el intervalo no se dispara a tiempo el usuario queda en Login.  
**Solución:** Después de guardar el token, navegar explícitamente con `navigation.reset`:
```tsx
await AsyncStorage.setItem("token", response.token);
navigation.reset({ index: 0, routes: [{ name: "Main" }] });
```
Y eliminar el `setInterval` en `AppNavigator`, sustituyéndolo por escucha de `AsyncStorage` via `AuthContext` (ver punto 7).

---

### 3. `RegisterScreen` redirige a `Login` en vez de `Main` tras registrarse
**Archivo:** `src/screens/RegisterScreen.tsx`  
**Problema:** El usuario se registra, recibe el token, y vuelve a Login en vez de entrar directamente a la app.
```tsx
// ❌ Actual
navigation.navigate("Login");

// ✅ Correcto
navigation.reset({ index: 0, routes: [{ name: "Main" }] });
```

---

### 4. `AuthContext` no persiste el token ni expone el usuario real
**Archivo:** `src/context/AuthContext.tsx`  
**Problema:** El contexto solo guarda `user` en memoria. Si la app se cierra y reabre, `user` es `null` aunque haya token en AsyncStorage. `PerfilMenu` y `HomeScreen` muestran siempre "Carlos" hardcodeado.  
**Solución:** Inicializar `AuthContext` leyendo el token de AsyncStorage y llamando a `GET /auth/me` para poblar el usuario real. El contexto debe ser la fuente de verdad para toda la app.

---

### 5. `tasksService` usa AsyncStorage local pero el backend ya tiene el endpoint real
**Archivos:** `src/services/tasksService.ts`  
**Problema:** Las tareas se guardan localmente con AsyncStorage mientras el backend tiene `GET /tasks/crop/:cropId`, `POST /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id` y `GET /tasks/crop/:cropId/pending-count` completamente operativos con JWT.  
Las tareas creadas en el móvil no se sincronizan con la base de datos.

---

## 🟠 PROBLEMAS DE COMPATIBILIDAD FRONT ↔ BACK

### Compatibilidad del módulo de Login (ya implementado por tu compañero)

Tras analizar el backend, el contrato es exactamente este:

**`POST /auth/login`**
```json
// REQUEST (ya correcto en authService.ts ✅)
{ "email": "user@test.com", "password": "123456" }

// RESPONSE del backend
{
  "token": "eyJ...",
  "user": {
    "id": 1,
    "nombre": "Carlos Aguilar",
    "email": "carlos@agroink.es",
    "telefono": "612345678",
    "rol": "agricultor"
  }
}
```

**`POST /auth/register`**
```json
// REQUEST (ya correcto en authService.ts ✅)
{ "nombre": "Carlos", "email": "...", "telefono": "...", "password": "..." }

// RESPONSE del backend (solo devuelve token, SIN user)
{ "token": "eyJ..." }
```

**Problema detectado:** `AuthResponse` en `auth.ts` define `user` como opcional, lo cual está bien. Pero `LoginScreen` no guarda el objeto `user` en el contexto tras el login, solo el token. El `AuthContext.signIn()` nunca recibe datos reales del usuario.

**Fix en `LoginScreen.handleLogin`:**
```tsx
const response = await login(loginData);
await AsyncStorage.setItem("token", response.token);
// Guardar también el user en contexto si viene:
if (response.user) {
  signIn(response.user); // desde useContext(AuthContext)
}
navigation.reset({ index: 0, routes: [{ name: "Main" }] });
```

**`GET /auth/me`** — requiere `Authorization: Bearer <token>` en header. El `authService.ts` actual no tiene esta función implementada. Hay que añadirla:
```ts
export const getMe = async (): Promise<User> => {
  const token = await AsyncStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Token inválido");
  return response.json();
};
```

**Campo `nombre` vs `username`:** El backend devuelve `nombre`, pero `PerfilMenu` usa `user?.username`. Hay que normalizar. El tipo `User` en `user.ts` ya usa `nombre` correctamente, el problema está en cómo se pasa el objeto a `PerfilMenu`.

---

## 🟡 PROBLEMAS LÓGICOS Y DE UX

### 6. `AppNavigator` usa polling cada 800ms para detectar el token
**Archivo:** `src/navigation/AppNavigator.tsx`  
**Problema:** Un `setInterval` corriendo indefinidamente es un anti-patrón. Consume batería, puede causar re-renders innecesarios y es difícil de depurar.  
**Solución:** Usar `AuthContext` como fuente de verdad. El navigator escucha el estado del contexto, no hace polling.

---

### 7. `HomeScreen` tiene datos hardcodeados
**Archivo:** `src/screens/HomeScreen.tsx`  
Resumen de cultivos (3, 2, 1), actividad reciente y el username "Carlos" son estáticos. Hay que conectarlos a los servicios reales una vez el backend de cultivos esté activo.

---

### 8. `BottomNav` no tiene iconos
**Archivo:** `src/navigation/BottomNav.tsx`  
El tab bar solo muestra texto, sin íconos. Aunque no rompe nada, es un UX pendiente importante para la entrega.

---

### 9. `API_BASE_URL` hardcodeada con IP local
**Archivos:** `authService.ts`, `cropsService.ts`  
```ts
const API_BASE_URL = "http://192.168.1.179:3000";
```
Esta IP solo funciona en la red de casa de quien desarrolló. Hay que centralizarla en un único fichero de configuración para poder cambiarla fácilmente.

---

### 10. `tasksService` — tipo de tarea en DB es ENUM en español minúscula
**Base de datos:** `ENUM('siembra','riego','fertilizacion','cosecha')`  
**Frontend:** `"Siembra" | "Riego" | "Fertilización" | "Cosecha"` (mayúsculas y con tilde)  
Al conectar el tasksService al backend habrá conflicto. Hay que normalizar antes de enviar:
```ts
tipo: selectedType.toLowerCase().replace("ó", "o") // "Fertilización" → "fertilizacion"
```

---

## ✅ PLAN DE ACCIÓN POR PRIORIDAD

### FASE 1 — Estabilizar lo que ya funciona (1-2 días)

| # | Tarea | Archivo |
|---|-------|---------|
| 1 | Fix import `ChatScreen` en AppNavigator | `AppNavigator.tsx` |
| 2 | Fix navegación post-login (reset a Main) | `LoginScreen.tsx` |
| 3 | Fix navegación post-register (reset a Main) | `RegisterScreen.tsx` |
| 4 | Centralizar `API_BASE_URL` en `src/config/api.ts` | Nuevo archivo |
| 5 | Añadir `getMe()` en `authService.ts` | `authService.ts` |

### FASE 2 — AuthContext robusto (1 día)

| # | Tarea | Archivo |
|---|-------|---------|
| 6 | Refactorizar `AuthContext` con persistencia real | `AuthContext.tsx` |
| 7 | Eliminar `setInterval` de `AppNavigator` | `AppNavigator.tsx` |
| 8 | Pasar `user.nombre` correctamente a `PerfilMenu` | `HomeScreen.tsx` |
| 9 | Guardar `user` en contexto al hacer login | `LoginScreen.tsx` |

### FASE 3 — Conectar tasksService al backend (1 día)

| # | Tarea | Archivo |
|---|-------|---------|
| 10 | Reemplazar `tasksService` AsyncStorage → fetch real | `tasksService.ts` |
| 11 | Normalizar tipos de tarea (mayúsculas ↔ ENUM DB) | `tasksService.ts` |
| 12 | Actualizar `getPendingCount` usando endpoint real | `tasksService.ts` |

### FASE 4 — UX y pulido (1-2 días)

| # | Tarea | Archivo |
|---|-------|---------|
| 13 | Añadir íconos al BottomNav | `BottomNav.tsx` |
| 14 | Conectar `HomeScreen` a datos reales | `HomeScreen.tsx` |
| 15 | Gestión de token expirado (401 → logout automático) | `authService.ts` |
| 16 | Manejo de errores de red offline | Todos los services |

---

## 📋 ARCHIVOS NUEVOS A CREAR

### `src/config/api.ts`
```ts
// Cambiar solo aquí cuando cambie la IP o se despliegue
export const API_BASE_URL = "http://192.168.1.179:3000";

export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
  const token = await AsyncStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Interceptor de errores de autenticación
export const handleApiResponse = async (response: Response) => {
  if (response.status === 401) {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.removeItem("token");
    // Emitir evento para que AuthContext haga logout
    throw new Error("SESSION_EXPIRED");
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Error de servidor");
  }
  return response.json();
};
```

---

## 🔌 RESUMEN DE ENDPOINTS DEL BACKEND DISPONIBLES

| Método | Ruta | Auth | Frontend conectado |
|--------|------|------|--------------------|
| POST | `/auth/login` | No | ✅ Sí |
| POST | `/auth/register` | No | ✅ Sí |
| GET | `/auth/me` | JWT | ❌ Falta `getMe()` |
| GET | `/crops` | JWT | ✅ Sí |
| POST | `/crops` | JWT | ✅ Sí |
| GET | `/crops/:id` | JWT | ✅ Sí |
| PATCH | `/crops/:id` | JWT | ✅ Sí |
| DELETE | `/crops/:id` | JWT | ✅ Sí |
| GET | `/crops/parcels/list` | JWT | ✅ Sí |
| GET | `/tasks/crop/:cropId` | JWT | ❌ Usa AsyncStorage |
| POST | `/tasks` | JWT | ❌ Usa AsyncStorage |
| PATCH | `/tasks/:id` | JWT | ❌ Usa AsyncStorage |
| DELETE | `/tasks/:id` | JWT | ❌ Usa AsyncStorage |
| GET | `/tasks/crop/:cropId/pending-count` | JWT | ❌ Usa AsyncStorage |

---

*Plan generado el 11/05/2026 · AgroLink TFG*