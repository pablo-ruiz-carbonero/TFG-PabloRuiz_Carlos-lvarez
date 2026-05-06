# Proyecto TFG - Sistema Agrícola

## Descripción del Proyecto

Este es un Trabajo de Fin de Grado (TFG) que consiste en el desarrollo de un sistema agrícola integral. El sistema permite a diferentes tipos de usuarios (agricultores, distribuidores, proveedores y administradores) gestionar parcelas, cultivos, productos y transacciones a través de una aplicación móvil y un backend robusto.

La aplicación móvil permite a los usuarios acceder a información meteorológica, gestionar sus parcelas y realizar operaciones relacionadas con la agricultura. El backend proporciona APIs RESTful para la autenticación, gestión de usuarios y datos agrícolas.

## Arquitectura General

El proyecto sigue una arquitectura cliente-servidor:

- **Frontend**: Aplicación móvil desarrollada con React Native y Expo.
- **Backend**: API REST desarrollada con NestJS (framework de Node.js).
- **Base de Datos**: MySQL, ejecutándose en un contenedor Docker.
- **Comunicación**: El frontend se comunica con el backend a través de HTTP/HTTPS, y el backend interactúa con la base de datos MySQL.

## Tecnologías Utilizadas

### Backend
- **Lenguaje**: TypeScript
- **Framework**: NestJS (basado en Node.js)
- **ORM**: TypeORM
- **Base de Datos**: MySQL 8.0
- **Autenticación**: JWT (JSON Web Tokens) - parcialmente implementado
- **Validación**: Class-validator (por implementar)
- **Encriptación**: Bcrypt (por implementar)
- **Contenedor**: Docker para la base de datos

### Frontend
- **Lenguaje**: TypeScript
- **Framework**: React Native
- **Plataforma**: Expo
- **Navegación**: React Navigation (Stack y Tab)
- **Estado**: Context API para autenticación
- **UI**: Componentes personalizados
- **APIs**: Fetch para comunicación con backend

### Base de Datos
- **Motor**: MySQL 8.0
- **Contenedor**: Docker Compose
- **Esquema**: Definido en `database/schema.sql`
- **Datos Iniciales**: Cargados desde `database/seed.sql`

## Estructura del Proyecto

```
TFG/
├── backend/
│   ├── src/
│   │   ├── common/          # Decoradores, guards, interceptores, pipes
│   │   ├── config/          # Configuraciones
│   │   ├── database/
│   │   │   └── entities/    # Entidades TypeORM (Role, User, etc.)
│   │   ├── modules/
│   │   │   ├── auth/        # Módulo de autenticación
│   │   │   └── users/       # Módulo de usuarios
│   │   ├── shared/          # DTOs, utilidades
│   │   ├── app.module.ts    # Módulo raíz
│   │   └── main.ts          # Punto de entrada
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── mobile/
│       └── app-mobile/
│           ├── src/
│           │   ├── components/  # Componentes reutilizables
│           │   ├── context/     # Context API (AuthContext)
│           │   ├── navigation/  # Configuración de navegación
│           │   ├── screens/     # Pantallas de la app
│           │   ├── services/    # Servicios (authService)
│           │   ├── styles/      # Tema y estilos
│           │   └── types/       # Definiciones de tipos
│           ├── App.tsx
│           ├── package.json
│           └── tsconfig.json
├── database/
│   ├── schema.sql           # Esquema de la base de datos
│   └── seed.sql             # Datos iniciales
├── docker/
│   └── docker-compose.yml   # Configuración de Docker
└── README.md                # Este documento
```

## Base de Datos

### Esquema

La base de datos contiene las siguientes tablas principales:

1. **roles**
   - `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
   - `nombre` (VARCHAR(50), NOT NULL)

2. **usuarios**
   - `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
   - `nombre` (VARCHAR(100))
   - `email` (VARCHAR(100), UNIQUE)
   - `password` (VARCHAR(255))
   - `rol_id` (INT, FOREIGN KEY -> roles.id)
   - `fecha_creacion` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

3. **parcelas** (y otras tablas relacionadas con agricultura - definidas en schema.sql)

### Comportamiento
- La base de datos se inicializa automáticamente al ejecutar `docker-compose up` en la carpeta `docker/`.
- Los archivos `schema.sql` y `seed.sql` se ejecutan en el orden correcto durante la creación del contenedor.
- TypeORM sincroniza las entidades automáticamente (synchronize: true en desarrollo).
- Conexión: Host: localhost, Puerto: 3310, Usuario: tfg_user, Password: tfg_password, DB: tfg_agricola

## Backend (NestJS)

### Módulos Principales
- **AuthModule**: Maneja autenticación (login, registro) - parcialmente implementado.
- **UsersModule**: Gestión de usuarios (por implementar).
- **AppModule**: Módulo raíz que importa TypeORM y otros módulos.

### Entidades
- **Role**: Representa roles de usuario (agricultor, distribuidor, etc.).
- **User**: Representa usuarios del sistema, relacionados con roles.

### APIs
- **Autenticación**: `/auth/login`, `/auth/register` (endpoints por implementar).
- Puerto: 3000

### Comportamiento
- El backend valida credenciales, genera tokens JWT y protege rutas con guards.
- Usa TypeORM para consultas a la base de datos.
- Maneja errores con interceptores y pipes.

## Frontend (React Native con Expo)

### Pantallas
- **AuthLoader**: Verifica autenticación al iniciar.
- **LoginScreen**: Pantalla de inicio de sesión.
- **RegisterScreen**: Pantalla de registro.
- **HomeScreen**: Pantalla principal con información general.
- **ProfileScreen**: Perfil del usuario.
- **WeatherScreen**: Información meteorológica.

### Navegación
- **StackNavigator**: Para pantallas de autenticación.
- **TabNavigator**: Para pantallas principales (Home, Profile, etc.).

### Servicios
- **authService**: Maneja login, registro y almacenamiento de tokens.

### Comportamiento
- La app verifica el token al iniciar y redirige a login si no está autenticado.
- Usa Context API para manejar el estado de autenticación global.
- Se conecta al backend para obtener datos (usuario, clima, etc.).

## Instalación y Ejecución

### Prerrequisitos
- Node.js (v22+)
- npm
- Docker y Docker Compose
- Expo CLI (para el frontend móvil)

### Pasos de Instalación

1. **Clonar el repositorio** (si aplica) y navegar a la raíz del proyecto.

2. **Instalar dependencias del backend**:
   ```
   cd backend
   npm install
   ```

3. **Instalar dependencias del frontend**:
   ```
   cd ../frontend/mobile/app-mobile
   npm install
   ```

4. **Iniciar la base de datos**:
   ```
   cd ../../../docker
   sudo docker-compose up -d
   ```

5. **Ejecutar el backend**:
   ```
   cd ../backend
   npm run start:dev
   ```

6. **Ejecutar el frontend**:
   ```
   cd ../frontend/mobile/app-mobile
   npm start
   ```

### Verificación
- Backend: Acceder a `http://localhost:3000` (debería responder).
- Base de datos: Conectar a `localhost:3310` con las credenciales especificadas.
- Frontend: Usar Expo Go en dispositivo móvil o emulador.

## Estado Actual del Desarrollo

### Cambios realizados en esta integración

#### Backend
- Se completó la integración de autenticación con JWT en el backend.
- Se añadieron los módulos `CropsModule` y `TasksModule` con sus controladores, servicios y DTOs.
- Se agregaron entidades TypeORM para `Crop` y `Task` en `backend/src/database/entities/`.
- Se protegieron rutas con `AuthGuard('jwt')` en `crops.controller.ts` y `tasks.controller.ts`.
- Se actualizó `backend/src/app.module.ts` para incluir `CropsModule` y `TasksModule`.
- Se ajustaron los servicios para que las operaciones CRUD de cultivos y tareas funcionen por usuario.

#### Frontend
- Se actualizó `frontend/mobile/app-mobile/src/services/authService.ts` para usar los endpoints reales del backend (`/auth/login`, `/auth/register`).
- Se implementó el almacenamiento de token JWT en `AsyncStorage` y el envío de headers de autorización en todas las peticiones.
- Se actualizó `frontend/mobile/app-mobile/src/services/cropsService.ts` para consumir el endpoint `/crops` y transformar la respuesta del backend al modelo del frontend.
- Se reemplazó el mock de cultivos por llamadas reales al backend para obtener, crear, actualizar y eliminar cultivos.
- Se añadió soporte para obtener parcelas reales desde `/crops/parcels/list`.
- Se actualizó `frontend/mobile/app-mobile/src/services/tasksService.ts` para consumir los endpoints `/tasks`, `/tasks/crop/:id`, `/tasks/:id` y manejar la creación, actualización, eliminación y cambio de estado.

#### Base de Datos
- Se actualizó `database/schema.sql` para reflejar el esquema real utilizado por el backend.
- La tabla `cultivos` ahora incluye campos como `variedad`, `tipo_cultivo`, `superficie`, `fecha_siembra`, `fase_actual`, `fecha_cosecha_esperada`, `produccion_esperada`, `notas`, `ultimo_riego`, `ultima_fertilizacion`, `dias_riego`, `dias_fertilizacion`, `status`, `usuario_id`, `parcela_id`, `fecha_creacion` y `updated_at`.
- La tabla `tareas` incluye ahora `cultivo_id`, `tipo`, `fecha`, `hora`, `descripcion`, `cantidad`, `unidad`, `status` y `fecha_creacion`.
- Se mantuvo `database/seed.sql` con los roles iniciales.

### Estado actual
- La autenticación backend-frontend está integrada y funciona con JWT.
- Las rutas de cultivos y tareas ya están conectadas al frontend.
- El frontend ya no depende de datos mock para cultivos ni de `AsyncStorage` local para tareas.
- La base de datos está alineada con las entidades del backend y puede almacenar cultivos y tareas reales.

## Notas para Claude (o cualquier desarrollador)

Este documento proporciona una visión general completa del proyecto. Para trabajar en él:

- **Backend**: Familiarízate con NestJS y TypeORM. Implementa la autenticación usando @nestjs/jwt y passport.
- **Frontend**: Usa Expo para desarrollo móvil. Implementa llamadas a API y manejo de estado.
- **Base de Datos**: Revisa schema.sql para entender las relaciones.
- **Docker**: Usa docker-compose para desarrollo local.

Si necesitas implementar una funcionalidad específica, revisa los archivos existentes y sigue las convenciones del proyecto (TypeScript, estructura modular).

## Contacto

Para preguntas sobre el proyecto, contacta al desarrollador principal.