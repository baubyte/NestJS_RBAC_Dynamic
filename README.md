# 🚀 NestJS RBAC Dynamic - Sistema de Control de Acceso Basado en Roles

Sistema backend robusto desarrollado con **NestJS**, **TypeORM** y **MariaDB**, implementando un sistema completo de **RBAC (Role-Based Access Control)** con permisos dinámicos, autenticación JWT, validaciones personalizadas y logging avanzado con Winston.

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Módulos Implementados](#-módulos-implementados)
- [Sistema RBAC](#-sistema-rbac-role-based-access-control)
- [API Endpoints](#-api-endpoints)
- [Validaciones Personalizadas](#-validaciones-personalizadas)
- [Logging](#-logging-con-winston)
- [Testing](#-testing)
- [Documentación Adicional](#-documentación-adicional)

---

## ✨ Características Principales

### 🔐 Seguridad y Autenticación
- ✅ Autenticación JWT con Passport
- ✅ Sistema RBAC (Roles y Permisos) dinámico
- ✅ Decorador `@Auth()` flexible (roles, permisos o ambos)
- ✅ Guards personalizados para protección de rutas
- ✅ Hash de contraseñas con bcrypt
- ✅ Validación de contraseñas fuertes

### 🎯 Sistema de Permisos
- ✅ Auto-detección de permisos desde el código
- ✅ Sincronización automática en desarrollo
- ✅ CRUD completo de roles y permisos
- ✅ Asignación dinámica de permisos a roles
- ✅ Soft delete para roles y permisos

### 🛠️ Funcionalidades Avanzadas
- ✅ Validadores personalizados con inyección de dependencias
- ✅ Logging estructurado con Winston (archivos rotativos)
- ✅ Sistema de seeds con protección para producción
- ✅ Documentación Swagger automática
- ✅ Gestión de archivos con validación
- ✅ Paginación configurable

### 🏗️ Arquitectura
- ✅ Modular y escalable siguiendo principios SOLID
- ✅ Inyección de dependencias
- ✅ Separación de responsabilidades
- ✅ DTOs con validación exhaustiva
- ✅ Exception handling centralizado

---

## 🛠️ Stack Tecnológico

### Core
- **Framework**: NestJS 11.0.1
- **Runtime**: Node.js (v18+)
- **Package Manager**: Yarn
- **Base de Datos**: MariaDB 10.11
- **ORM**: TypeORM 0.3.28

### Librerías Principales
```json
{
  "@nestjs/jwt": "^11.0.0",
  "@nestjs/passport": "^10.0.3",
  "@nestjs/swagger": "^8.0.8",
  "@nestjs/typeorm": "^11.0.5",
  "bcrypt": "^5.1.1",
  "class-validator": "^0.14.1",
  "class-transformer": "^0.5.1",
  "passport-jwt": "^4.0.1",
  "winston": "^3.19.0",
  "nest-winston": "^1.10.2",
  "winston-daily-rotate-file": "^5.0.0"
}
```

---

## 🏗️ Arquitectura del Sistema

```
src/
├── access-control/          # CRUD de roles y permisos
│   ├── entities/            # Role, Permission
│   ├── dto/                 # DTOs de roles y permisos
│   ├── access-control.service.ts
│   ├── access-control.controller.ts
│   └── permissions-scanner.service.ts  # Auto-detección
│
├── auth/                    # Autenticación y autorización
│   ├── decorators/          # @Auth(), @GetUser(), etc.
│   ├── guards/              # RolesPermissionsGuard
│   ├── strategies/          # JwtStrategy
│   ├── dto/                 # CreateUser, Login, etc.
│   └── entities/            # User
│
├── common/                  # Módulos compartidos
│   ├── validators/          # @Exists, @IsUnique, @IsStrongPassword
│   ├── adapters/            # Bcrypt, Axios
│   ├── dto/                 # PaginationDto
│   └── exceptions/          # Exception handling
│
├── config/                  # Configuraciones
│   ├── envs.ts             # Variables de entorno
│   ├── datasource.ts       # TypeORM DataSource
│   └── winston.config.ts   # Winston logger
│
├── product/                # Gestión de productos
├── category/               # Gestión de categorías
├── files/                  # Gestión de archivos
└── seed/                   # Seeds con protección
```

---

## 🚀 Instalación y Configuración

### 1️⃣ Requisitos Previos

- **Node.js**: v18 o superior
- **Yarn**: Instalado globalmente
- **Docker Desktop**: Para MariaDB (opcional)
- **Git**: Para clonar el repositorio

### 2️⃣ Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/nestjs-rbac-dynamic.git
cd nestjs-rbac-dynamic
```

### 3️⃣ Instalar Dependencias

```bash
yarn install
```

### 4️⃣ Configurar Base de Datos

#### Opción A: Con Docker (Recomendado)

```bash
# Levantar MariaDB con Docker Compose
docker-compose up -d

# Verificar que esté corriendo
docker ps
```

#### Opción B: MariaDB Local

1. Instalar MariaDB 10.11+
2. Crear la base de datos:
```sql
CREATE DATABASE nest_rbac_dynamic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5️⃣ Configurar Variables de Entorno

Copiar el archivo de ejemplo y configurar:

```bash
cp .env.template .env
```

Editar `.env`:

```bash
# Aplicación
PORT=3000
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=nest_rbac_dynamic
DB_SYNCHRONIZE=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h

# Roles por defecto
DEFAULT_USER_ROLE=user

# Permisos (auto-sync solo en development)
PERMISSIONS_AUTO_SYNC=false
```

### 6️⃣ Ejecutar la Aplicación

#### Desarrollo
```bash
# Con auto-reload
yarn start:dev

# Ver logs detallados
yarn start:dev --debug
```

#### Producción
```bash
# Build
yarn build

# Ejecutar
yarn start:prod
```

### 7️⃣ Ejecutar Seed Inicial

**⚠️ IMPORTANTE**: El seed solo se puede ejecutar **UNA VEZ en producción** para prevenir duplicados.

```bash
# Opción 1: Desde la API
curl -X POST http://localhost:3000/api/seed/run

# Opción 2: Desde el navegador
POST http://localhost:3000/api/seed/run
```

El seed crea:
- ✅ Roles básicos: `admin`, `user`, `super-admin`
- ✅ Permisos por módulo: `users.*`, `roles.*`, `permissions.*`
- ✅ Usuario administrador por defecto
- ✅ Datos de ejemplo (productos, categorías)

---

## 📦 Módulos Implementados

### 1. 🔐 Auth Module

**Responsabilidad**: Autenticación, gestión de usuarios y asignación de roles.

**Endpoints Principales**:
```
POST   /auth/register         # Registrar usuario
POST   /auth/login            # Login y obtener JWT
GET    /auth/verify           # Verificar token actual
```

**Características**:
- Autenticación JWT con Passport
- Hash de contraseñas con bcrypt
- Asignación de rol por defecto (`user`)
- Asignación de múltiples roles al registrar
- Validaciones personalizadas

**Ejemplo de Registro**:
```json
POST /auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role_ids": [1, 2]  // Opcional
}
```

### 2. 🎯 Access Control Module

**Responsabilidad**: CRUD de roles, asignación de permisos, visualización de permisos.

**Endpoints Principales**:
```
# ROLES
POST   /access-control/roles                  # Crear rol
GET    /access-control/roles                  # Listar roles
GET    /access-control/roles/:id              # Ver rol
PATCH  /access-control/roles/:id              # Actualizar rol
DELETE /access-control/roles/:id              # Eliminar rol

# PERMISOS A ROLES
POST   /access-control/roles/:id/permissions        # Asignar (reemplaza)
PATCH  /access-control/roles/:id/permissions/add    # Agregar
PATCH  /access-control/roles/:id/permissions/remove # Remover

# PERMISOS
GET    /access-control/permissions            # Listar permisos
GET    /access-control/permissions/:id        # Ver permiso
POST   /access-control/permissions/sync       # Sincronizar permisos (admin)
```

**Protección**: Requiere roles `admin` o `super-admin` + permisos específicos.

### 3. 🔍 Permissions Scanner Service

**Responsabilidad**: Auto-detección de permisos desde el código.

**Funcionamiento**:
1. Escanea todos los controladores al iniciar la app
2. Detecta decoradores `@Auth()` y `@RequirePermissions()`
3. Crea automáticamente permisos nuevos en la BD
4. Genera descripciones automáticas

**Configuración**:
- **Desarrollo**: Auto-sync habilitado por defecto
- **Producción**: Auto-sync deshabilitado (usar endpoint manual)

**Ejemplo**:
```typescript
@Controller('posts')
export class PostsController {
  @Post()
  @Auth({ permissions: ['posts.create'] })  // 👈 Se detecta automáticamente
  create() { }
}
```

### 4. 📝 Product Module

**Endpoints**:
```
POST   /products              # Crear producto
GET    /products              # Listar productos (paginado)
GET    /products/:id          # Ver producto
PATCH  /products/:id          # Actualizar producto
DELETE /products/:id          # Eliminar producto
```

### 5. 🏷️ Category Module

**Endpoints**:
```
POST   /categories            # Crear categoría
GET    /categories            # Listar categorías
GET    /categories/:id        # Ver categoría
PATCH  /categories/:id        # Actualizar categoría
DELETE /categories/:id        # Eliminar categoría
```

### 6. 📁 Files Module

**Endpoints**:
```
POST   /files/upload          # Subir archivo
GET    /files/:filename       # Descargar archivo
```

**Características**:
- Validación de tipos de archivo
- Límite de tamaño configurable
- Almacenamiento en `/static/uploads`

### 7. 🌱 Seed Module

**Endpoint**:
```
POST   /seed/run                  # Ejecutar seed
```

**Protección**:
- Solo se ejecuta **UNA VEZ** en producción
- Crea estructura completa de roles, permisos y usuarios
- Registra ejecución en tabla `seed_executions`

---

## 🔒 Sistema RBAC (Role-Based Access Control)

### Arquitectura

```
Usuario (User)
    ↓ many-to-many
Rol (Role)
    ↓ many-to-many
Permiso (Permission)
```

### Decorador @Auth() Flexible

El decorador `@Auth()` es el corazón del sistema de autorización:

#### 1. Solo Autenticación
```typescript
@Get('profile')
@Auth()  // ✅ Solo verifica JWT
getProfile() { }
```

#### 2. Solo Permisos
```typescript
@Post('users')
@Auth({ permissions: ['users.create'] })  // ✅ Debe tener TODOS los permisos
createUser() { }
```

#### 3. Solo Roles
```typescript
@Get('admin/dashboard')
@Auth({ roles: ['admin', 'super-admin'] })  // ✅ Debe tener AL MENOS UN rol
getDashboard() { }
```

#### 4. Roles Y Permisos (Ambos)
```typescript
@Delete('users/:id')
@Auth({ 
  roles: ['admin'], 
  permissions: ['users.delete'] 
})  // ✅ Debe cumplir AMBAS condiciones
deleteUser() { }
```

### Lógica de Validación

| Configuración | Roles | Permisos | Resultado |
|--------------|-------|----------|-----------|
| `@Auth()` | ❌ | ❌ | Solo JWT |
| `@Auth({ permissions: ['x'] })` | ❌ | ✅ Todos | Requiere todos los permisos |
| `@Auth({ roles: ['x', 'y'] })` | ✅ Al menos uno | ❌ | Requiere al menos un rol |
| `@Auth({ roles: ['x'], permissions: ['y'] })` | ✅ Al menos uno | ✅ Todos | Requiere ambas condiciones |

---

## 🌐 API Endpoints

### Documentación Swagger

Una vez iniciada la aplicación, acceder a:

```
http://localhost:3000/api/docs
```

### Autenticación en Swagger

1. Registrarse o hacer login
2. Copiar el token JWT
3. Click en "Authorize" 🔓
4. Ingresar: `Bearer YOUR_TOKEN_HERE`

---

## ✅ Validaciones Personalizadas

### @Exists - Validar existencia en BD

```typescript
import { Exists } from '@/common/validators';

export class CreatePostDto {
  @Exists(Category, 'id')
  category_id: number;  // ✅ Valida que la categoría exista
}
```

### @IsUnique - Validar unicidad

```typescript
import { IsUnique } from '@/common/validators';

export class CreateUserDto {
  @IsUnique(User, 'email')
  email: string;  // ✅ Valida que el email no exista
}

export class UpdateUserDto {
  @IsUnique(User, 'email', 'id')
  email: string;  // ✅ Excluye el ID actual en updates
}
```

### @IsStrongPassword - Validar contraseña fuerte

```typescript
import { IsStrongPassword } from '@/common/validators';

export class CreateUserDto {
  @IsStrongPassword()
  password: string;  // ✅ Requiere mayúsculas, minúsculas y números/especiales
}
```

---

## 📊 Logging con Winston

### Configuración

**Desarrollo**:
- Logs en consola con formato NestJS
- Nivel: `debug`

**Producción**:
- Logs en archivos rotativos:
  - `logs/application-%DATE%.log` (info+)
  - `logs/error-%DATE%.log` (solo errores)
- Retención: 14 días (application), 30 días (error)
- Nivel: `info`

### Uso en Servicios

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  async doSomething() {
    this.logger.log('Operación iniciada');
    this.logger.debug('Datos:', data);
    this.logger.error('Error:', error.stack);
  }
}
```

---

## 🗃️ Migraciones de Base de Datos

### Configuración TypeORM

Este proyecto usa TypeORM con soporte para migraciones. Las migraciones se almacenan en `db/migrations/`.

### Scripts Disponibles

```bash
# Ver estado de migraciones
yarn migration:show

# Generar migración automáticamente (detecta cambios)
yarn migration:generate db/migrations/NombreMigracion

# Crear migración vacía (manual)
yarn migration:create db/migrations/NombreMigracion

# Ejecutar migraciones pendientes
yarn migration:run

# Revertir última migración
yarn migration:revert
```

### Generar Migración Inicial

Si estás empezando y tienes `DB_SYNCHRONIZE=true`:

```bash
# 1. Cambiar a false en .env
DB_SYNCHRONIZE=false

# 2. Generar migración inicial
yarn migration:generate db/migrations/InitialSchema

# 3. Ejecutar migración
yarn migration:run

# 4. Ejecutar seed
curl -X POST http://localhost:3000/api/seed/run
```

### Workflow de Desarrollo

#### Desarrollo Local
```bash
# .env
DB_SYNCHRONIZE=true  # TypeORM sincroniza automáticamente
```

#### Staging/Producción
```bash
# .env
DB_SYNCHRONIZE=false  # Usar migraciones

# Desplegar cambios
yarn build
yarn migration:run
yarn start:prod
```

### Ejemplo: Agregar Campo a Entidad

```typescript
// src/auth/entities/user.entity.ts
@Entity('users')
export class User {
  // ... campos existentes

  @Column({ default: true })
  is_active: boolean;  // 👈 Nuevo campo
}
```

### Mejores Prácticas

✅ **Hacer**:
- Usar migraciones en producción (`DB_SYNCHRONIZE=false`)
- Nombrar migraciones descriptivamente: `AddEmailToUser`, `CreateProductsTable`
- Revisar la migración generada antes de aplicarla
- Versionar migraciones en Git
- Probar migraciones en staging antes de producción

❌ **No Hacer**:
- Usar `DB_SYNCHRONIZE=true` en producción
- Editar migraciones ya aplicadas
- Eliminar migraciones del historial
- Ejecutar `migration:revert` en producción sin respaldo

---

## 🧪 Testing

```bash
# Tests unitarios
yarn test

# Tests e2e
yarn test:e2e

# Coverage
yarn test:cov
```

---

## 📚 Documentación Adicional

- [Sistema RBAC Flexible](src/auth/decorators/auth-examples.md)
- [PermissionsScanner](src/access-control/PERMISSIONS_SCANNER.md)
- [Access Control Module](src/access-control/README.md)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## 👥 Autor

**Baubyte** - [GitHub](https://github.com/baubyte)

---

## 🙏 Agradecimientos

- NestJS Team
- TypeORM Team
- Comunidad Open Source