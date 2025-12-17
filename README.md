# Backend - NestJS + TypeORM + MariaDB

Proyecto desarrollado con **NestJS**, **TypeORM** y **MariaDB**.  
Está preparado para entornos de desarrollo, con opciones para levantar la base de datos automáticamente mediante **Docker Compose** o conectarse a una base creada manualmente.

---

## Configuración del entorno

### 1️⃣ Clonar el repositorio

```
git clone https://github.com/Tecnocode-tech/Taxos.git
cd backend
```

### 2️⃣ Instalar dependencias
```
npm install
```

#### Opción A: Levantar la base de datos con Docker
Tener instalado y levantado docker-desktop

Este proyecto incluye un docker-compose.yml que crea una instancia de MariaDB con los parámetros esperados por TypeORM. 
```
docker-compose up --build -d
```
---
#### Opción B: Usar una base de datos local/manual

Usar tu propia base de datos (local o remota):

Crea una base de datos vacía en MariaDB. Nobre de la base de datos: db-taxos


### 3️⃣ Crear el archivo .env basándose en .env.template

### 4️⃣ Correr el proyecto
npm run start:dev

### 5️⃣ Ejecutar el seed para probar datos iniciales de usuario

Desde el navegador o usando Postman hacer un request a:

GET http://localhost:3000/api/seed