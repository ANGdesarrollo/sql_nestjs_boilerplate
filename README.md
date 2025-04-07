# NestJS Auth - Sistema Multi-Tenant con Roles y Permisos (EN PROGRESO)

Este proyecto implementa un sistema de autenticación multi-tenant completo con gestión de roles y permisos utilizando NestJS, TypeORM y PostgreSQL. Proporciona un conjunto de APIs RESTful para la gestión de usuarios, tenants (inquilinos), roles y permisos.

## Características principales

- 🔐 **Sistema de autenticación**: Login con JWT y cookies seguras
- 👥 **Multi-tenancy**: Soporte para múltiples organizaciones/espacios de trabajo
- 👮 **Control de acceso basado en roles (RBAC)**: Sistema completo de roles y permisos
- 📝 **API RESTful**: Endpoints completos para gestión de usuarios y tenants
- 🧩 **Arquitectura modular**: Diseño usando Arquitectura Limpia (Clean Architecture)
- 🐘 **Base de datos PostgreSQL**: Almacenamiento persistente con TypeORM

## Requisitos previos

- [Node.js](https://nodejs.org/) (v16 o superior)
- [pnpm](https://pnpm.io/) (recomendado para gestión de paquetes)
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/) (para la base de datos)

## Configuración inicial

### 1. Instalar dependencias

```bash
pnpm install
```

### 3. Configuración del entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Entorno
NODE_ENV=development
PORT=8000

# Base de datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=nest_auth

# JWT
JWT_SECRET=tu_secreto_jwt_super_seguro
JWT_EXPIRES_IN=1h

# Cookie
COOKIE_SECRET=tu_secreto_cookie_super_seguro
COOKIE_EXPIRATION=3600000
```

### 4. Iniciar la base de datos

El proyecto incluye un archivo `docker-compose.yml` que configura PostgreSQL y pgAdmin:

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en el puerto 5432
- pgAdmin en http://localhost:5050 (usuario: admin@admin.com, contraseña: admin)

### 5. Sincronizar roles y permisos

Antes de usar la aplicación, es necesario sincronizar los roles y permisos predefinidos:

```bash
pnpm run sync:roles
```

### 6. Crear superusuario (opcional)

Para crear un superusuario con acceso completo al sistema:

```bash
# Con credenciales aleatorias (se mostrarán en la consola)
pnpm run command create:superuser

# O con credenciales personalizadas
pnpm run command create:superuser --username admin --password adminpass --tenant-name "Mi Empresa" --tenant-slug miempresa
```

## Desarrollo

### Iniciar la aplicación en modo desarrollo

```bash
# Modo desarrollo con recarga automática
pnpm run start:dev

# O modo desarrollo normal
pnpm run start
```

### Compilación y ejecución para producción

```bash
# Compilar la aplicación
pnpm run build

# Ejecutar la versión compilada
pnpm run start:prod
```

## Estructura del proyecto

```
src/
├── App/                    # Módulo principal
├── Auth/                   # Módulo de autenticación
│   ├── Application/        # Casos de uso
│   ├── Domain/             # Entidades y reglas de dominio
│   ├── Infrastructure/     # Repositorios y schemas
│   └── Presentation/       # Controladores, guardias y validadores
├── Config/                 # Configuración global
│   ├── Env/                # Variables de entorno
│   ├── Permissions.ts      # Definición de permisos
│   └── Roles.ts            # Definición de roles
├── Shared/                 # Código compartido
│   ├── Domain/             # Interfaces base
│   ├── Infrastructure/     # Implementaciones compartidas
│   └── Presentation/       # Validadores y utilidades
└── main.ts                 # Punto de entrada
```



## Testing

```bash
# Tests unitarios
pnpm run test

# Tests e2e
pnpm run test:e2e

# Cobertura de tests
pnpm run test:cov
```

## Arquitectura

Este proyecto sigue los principios de Arquitectura Limpia (Clean Architecture) con capas bien definidas:

1. **Domain**: Contiene las entidades de negocio y reglas core
2. **Application**: Casos de uso que orquestan las entidades de dominio
3. **Infrastructure**: Implementaciones técnicas (repositorios, ORM)
4. **Presentation**: Controladores, DTOs, validadores y punto de entrada para las APIs

## Contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit de tus cambios: `git commit -m 'Añade nueva funcionalidad'`
4. Sube tus cambios: `git push origin feature/nueva-funcionalidad`
5. Envía un pull request

## Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).
