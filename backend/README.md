# 🚀 Backend - Sistema Kanban con Exportación

Backend desarrollado con **NestJS** que proporciona una API REST completa para la gestión de tableros Kanban con funcionalidades de exportación automática a CSV mediante **N8N**.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [WebSocket](#-websocket)
- [Exportación](#-exportación)
- [Health Checks](#-health-checks)
- [Desarrollo](#-desarrollo)
- [Producción](#-producción)
- [Troubleshooting](#-troubleshooting)

## ✨ Características

### 🎯 **Gestión de Tableros Kanban**

- ✅ Crear, editar y eliminar tableros
- ✅ Gestión de columnas (To Do, En Progreso, Done)
- ✅ Gestión de tarjetas con título, descripción y fechas
- ✅ Drag & Drop en tiempo real con WebSocket
- ✅ Colaboración en tiempo real entre usuarios

### 📊 **Exportación Automática**

- ✅ Exportación de tableros a CSV
- ✅ Integración con N8N para automatización
- ✅ Envío automático por email
- ✅ Configuración de campos personalizables
- ✅ Procesamiento asíncrono

### 🔍 **Monitoreo y Salud**

- ✅ Health checks para la aplicación
- ✅ Verificación de conectividad con MongoDB
- ✅ Verificación de estado de N8N
- ✅ Logging estructurado y métricas

### 🛡️ **Seguridad y Validación**

- ✅ Validación automática de datos de entrada
- ✅ Manejo global de excepciones
- ✅ Filtros de error especializados
- ✅ CORS configurado

## 🛠️ Tecnologías

- **Framework**: NestJS v11.0.1
- **Base de datos**: MongoDB v7.0 con Mongoose
- **WebSocket**: Socket.IO v4.8.1
- **Validación**: class-validator + class-transformer
- **Automatización**: N8N v1.106.3
- **HTTP Client**: Axios v1.12.2
- **Lenguaje**: TypeScript v5.7.3

## 🚀 Instalación

### Prerrequisitos

- **Node.js**: v18.0.0 o superior
- **npm**: v8.0.0 o superior
- **MongoDB**: v6.0+ (local o en la nube)
- **N8N**: v1.106.3 (para exportaciones)

### Pasos de Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/FrancoLadronDeGuevara/useTeam-PT.git
   cd useTeam-PT/backend
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar la aplicación**

   ```bash
   # Desarrollo
   npm run start:dev
   ```

## ⚙️ Configuración

### Variables de Entorno Requeridas

```bash
# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Base de datos
MONGODB_URI=mongodb://localhost:27017/kanban-board

# N8N (para exportaciones)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/kanban-export
```

### Configuración de MongoDB

```bash
# Local
MONGODB_URI=mongodb://localhost:27017/kanban-board
```

### Configuración de N8N

1. **Instalar N8N**

   ```bash
   npm install n8n -g
   # O usar Docker
   docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
   ```

2. **Importar workflow**
   - Acceder a `http://localhost:5678`
   - Importar el archivo `n8n/workflow.json`
   - Activar el workflow

## 📁 Estructura del Proyecto

```
src/
├── app.module.ts              # Módulo principal
├── main.ts                    # Punto de entrada
├── seed.ts                    # Datos de prueba
├── board/                     # Gestión de tableros
│   ├── board.controller.ts    # Controlador REST
│   ├── board.gateway.ts       # WebSocket Gateway
│   ├── board.service.ts       # Lógica de negocio
│   ├── board.module.ts        # Módulo de tableros
│   ├── dto/                   # DTOs de validación
│   └── schemas/               # Esquemas de MongoDB
├── export/                    # Exportación a CSV
│   ├── export.controller.ts   # Controlador de exportación
│   ├── export.service.ts      # Servicio de exportación
│   ├── export.module.ts       # Módulo de exportación
│   └── dto/                   # DTOs de exportación
├── health/                    # Health checks
│   ├── health.controller.ts   # Controlador de salud
│   ├── health.service.ts      # Servicio de salud
│   └── health.module.ts       # Módulo de salud
├── common/                    # Componentes compartidos
│   ├── filters/               # Filtros de excepción
│   ├── interceptors/          # Interceptores
│   └── pipes/                 # Pipes de validación
└── config/                    # Configuraciones
    ├── app.config.ts          # Configuración de app
    └── database.config.ts     # Configuración de DB
```

## 🌐 API Endpoints

### 📋 Tableros Kanban

| Método   | Endpoint          | Descripción                |
| -------- | ----------------- | -------------------------- |
| `GET`    | `/api/boards`     | Obtener todos los tableros |
| `POST`   | `/api/boards`     | Crear nuevo tablero        |
| `GET`    | `/api/boards/:id` | Obtener tablero por ID     |
| `PUT`    | `/api/boards/:id` | Actualizar tablero         |
| `DELETE` | `/api/boards/:id` | Eliminar tablero           |

### 🎯 Columnas

| Método   | Endpoint                            | Descripción        |
| -------- | ----------------------------------- | ------------------ |
| `POST`   | `/api/boards/:id/columns`           | Crear columna      |
| `PUT`    | `/api/boards/:id/columns/:columnId` | Actualizar columna |
| `DELETE` | `/api/boards/:id/columns/:columnId` | Eliminar columna   |

### 🃏 Tarjetas

| Método   | Endpoint                                  | Descripción        |
| -------- | ----------------------------------------- | ------------------ |
| `POST`   | `/api/boards/:id/columns/:columnId/cards` | Crear tarjeta      |
| `PUT`    | `/api/boards/:id/cards/:cardId`           | Actualizar tarjeta |
| `DELETE` | `/api/boards/:id/cards/:cardId`           | Eliminar tarjeta   |
| `PUT`    | `/api/boards/:id/cards/:cardId/move`      | Mover tarjeta      |

### 📊 Exportación

| Método | Endpoint              | Descripción                 |
| ------ | --------------------- | --------------------------- |
| `POST` | `/api/export/backlog` | Iniciar exportación         |
| `GET`  | `/api/export/columns` | Obtener datos para exportar |
| `GET`  | `/api/export/health`  | Verificar estado de N8N     |

### 🏥 Health Checks

| Método | Endpoint         | Descripción                |
| ------ | ---------------- | -------------------------- |
| `GET`  | `/api/health`    | Estado general de la app   |
| `GET`  | `/api/health/db` | Estado de la base de datos |

## 🔌 WebSocket

### Eventos Disponibles

#### Cliente → Servidor

- `join-board` - Unirse a un tablero
- `leave-board` - Salir de un tablero
- `move-card` - Mover tarjeta
- `create-card` - Crear tarjeta
- `update-card` - Actualizar tarjeta
- `delete-card` - Eliminar tarjeta

#### Servidor → Cliente

- `card-moved` - Tarjeta movida
- `card-created` - Tarjeta creada
- `card-updated` - Tarjeta actualizada
- `card-deleted` - Tarjeta eliminada
- `user-joined` - Usuario se unió
- `user-left` - Usuario salió

### Ejemplo de Uso

```javascript
// Conectar al WebSocket
const socket = io('http://localhost:3000');

// Unirse a un tablero
socket.emit('join-board', { boardId: 'board123' });

// Escuchar movimientos de tarjetas
socket.on('card-moved', (data) => {
  console.log('Tarjeta movida:', data);
});
```

## 📤 Exportación

### Flujo de Exportación

1. **Frontend** envía solicitud a `/api/export/backlog`
2. **Backend** activa webhook de N8N
3. **N8N** obtiene datos de `/api/export/columns`
4. **N8N** procesa y genera CSV
5. **N8N** envía email con archivo adjunto

### Ejemplo de Solicitud

```bash
curl -X POST http://localhost:3000/api/export/backlog \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": "64a1b2c3d4e5f6789abcdef0",
    "recipientEmail": "usuario@ejemplo.com",
    "fields": ["id", "title", "description", "column", "createdAt"]
  }'
```

### Respuesta

```json
{
  "status": "success",
  "message": "Solicitud de exportación enviada correctamente",
  "data": {
    "boardId": "64a1b2c3d4e5f6789abcdef0",
    "recipientEmail": "usuario@ejemplo.com",
    "timestamp": "2025-01-08T10:30:00.000Z"
  }
}
```

## 🏥 Health Checks

### Verificación General

```bash
curl http://localhost:3000/api/health
```

**Respuesta:**

```json
{
  "status": "ok",
  "timestamp": "2025-01-08T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

### Verificación de Base de Datos

```bash
curl http://localhost:3000/api/health/db
```

**Respuesta:**

```json
{
  "status": "ok",
  "database": "conectado",
  "timestamp": "2025-01-08T10:30:00.000Z"
}
```

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run start:dev

# Compilar TypeScript
npm run build

# Poblar base de datos con datos de prueba
npm run seed
```

### Estructura de Datos

#### Tablero (Board)

```typescript
{
  _id: ObjectId,
  title: string,
  description?: string,
  columns: Column[],
  createdAt: Date,
  updatedAt: Date
}
```

#### Columna (Column)

```typescript
{
  _id: ObjectId,
  title: string,
  position: number,
  cards: Card[],
  boardId: ObjectId
}
```

#### Tarjeta (Card)

```typescript
{
  _id: ObjectId,
  title: string,
  description?: string,
  position: number,
  columnId: ObjectId,
  boardId: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Monitoreo

- **Health checks**: `/api/health` y `/api/health/db`
- **Logs**: Estructurados con timestamps
- **Métricas**: Tiempo de respuesta y errores

## 🔧 Troubleshooting

### Problemas Comunes

#### Error de Conexión a MongoDB

```bash
Error: MongoDB connection error
```

**Solución**: Verificar que MongoDB esté ejecutándose y la URI sea correcta.

#### Error de N8N

```bash
Error al comunicarse con el servicio N8N
```

**Solución**: Verificar que N8N esté ejecutándose y el webhook sea accesible.

#### Error de CORS

```bash
CORS policy error
```

**Solución**: Verificar que `FRONTEND_URL` esté configurado correctamente.

### Logs de Debugging

```bash
# Habilitar logs detallados
LOG_LEVEL=debug npm run start:dev

# Ver logs de MongoDB
# Revisar la consola para mensajes de conexión

# Ver logs de N8N
# Revisar la interfaz web de N8N
```

### Verificación de Servicios

```bash
# Verificar backend
curl http://localhost:3000/api/health

# Verificar MongoDB
curl http://localhost:3000/api/health/db

# Verificar N8N
curl http://localhost:5678
```

## 📚 Recursos Adicionales

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Documentación de Socket.IO](https://socket.io/docs/)
- [Documentación de N8N](https://docs.n8n.io/)
- [Guía de N8N para este proyecto](../n8n/setup-instructions.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

---

**¡Desarrollado usando NestJS!**
