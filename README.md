# 📋 Tablero Kanban Colaborativo en Tiempo Real

Una aplicación tipo **Trello** desarrollada con React.js y NestJS que permite la gestión de tareas mediante un tablero Kanban con colaboración en tiempo real y exportación automática de backlog vía email.

## ✨ Características

### 🎯 Funcionalidades Principales

- ✅ **Tablero Kanban** con columnas personalizables
- ✅ **Drag & Drop** fluido para mover tarjetas entre columnas
- ✅ **Colaboración en tiempo real** con WebSocket
- ✅ **Gestión completa** de tableros, columnas y tarjetas
- ✅ **Tema claro/oscuro** con Tailwind CSS
- ✅ **Exportación de backlog** vía email en formato CSV
- ✅ **Notificaciones en tiempo real** entre usuarios

### 🚀 Tecnologías Utilizadas

#### Frontend

- **React.js 19** con TypeScript
- **@dnd-kit** para drag & drop
- **Tailwind CSS** para estilos
- **Socket.io Client** para WebSocket
- **Axios** para API calls
- **Vite** como bundler

#### Backend

- **NestJS** con TypeScript
- **MongoDB** con Mongoose
- **Socket.io** para WebSocket
- **Class Validator** para validaciones
- **Axios** para HTTP requests

#### Automatización

- **N8N** para workflows automatizados
- **Docker Compose** para orquestación
- **Gmail SMTP** para envío de emails

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 18+ y npm
- Docker y Docker Compose
- Cuenta de Gmail (para exportación)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/FrancoLadronDeGuevara/useTeam-PT.git
cd useTeam-PT
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables necesarias
nano .env
```

Configura las siguientes variables en `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/kanban-board

# Backend
PORT=3000
FRONTEND_URL=http://localhost:5173

# N8N
N8N_WEBHOOK_URL=http://localhost:5678/webhook/kanban-export

# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000

# Email (Gmail)
N8N_EMAIL_USER=tu-email@gmail.com
N8N_EMAIL_PASSWORD=tu-app-password
N8N_EMAIL_FROM=tu-email@gmail.com
```

### 3. Configurar Gmail App Password

1. Ve a [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification → App passwords
3. Selecciona "Mail" y crea una contraseña
4. Usa esta contraseña en `N8N_EMAIL_PASSWORD`

### 4. Levantar Servicios con Docker

```bash
# Levantar MongoDB y N8N
docker-compose up -d

# Verificar servicios
docker-compose ps
```

### 5. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 6. Configurar N8N Workflow

1. Abre N8N: `http://localhost:5678`
2. Importa el workflow: `File → Import → n8n/workflow.json`
3. Configura credenciales SMTP (ver `n8n/setup-instructions.md`)
4. Activa el workflow

## 🚀 Ejecución

### Desarrollo

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

## 📱 Uso de la Aplicación

### 1. Crear y Gestionar Tableros

- Haz clic en "Crear Nuevo Tablero"
- Agrega columnas personalizadas
- Crea tarjetas con títulos y descripciones

### 2. Drag & Drop

- Arrastra tarjetas entre columnas
- Los cambios se sincronizan en tiempo real
- Múltiples usuarios pueden colaborar simultáneamente

### 3. Exportar Backlog

- Haz clic en el botón "Export" (📥)
- Ingresa tu email de destino
- Recibe un archivo CSV con todas las tarjetas

## 📊 Estructura del Proyecto

```
useTeam-PT/
├── README.md
├── .env.example
├── docker-compose.yml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board/          # Componentes del tablero
│   │   │   ├── BoardList/      # Lista de tableros
│   │   │   └── UI/             # Componentes reutilizables
│   │   ├── context/            # Contextos de React
│   │   ├── services/           # API y WebSocket
│   │   └── types/              # Definiciones TypeScript
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── board/              # Módulo de tableros
│   │   ├── export/             # Módulo de exportación
│   │   ├── health/             # Health checks
│   │   └── common/             # Filtros, pipes, interceptors
│   └── package.json
└── n8n/
    ├── workflow.json           # Workflow de N8N
    └── setup-instructions.md   # Instrucciones detalladas
```

## 🔧 API Endpoints

### Tableros

- `GET /api/boards` - Listar tableros
- `POST /api/boards` - Crear tablero
- `GET /api/boards/:id` - Obtener tablero
- `PUT /api/boards/:id` - Actualizar tablero
- `DELETE /api/boards/:id` - Eliminar tablero

### Columnas

- `POST /api/boards/:id/columns` - Crear columna
- `PUT /api/columns/:id` - Actualizar columna
- `DELETE /api/columns/:id` - Eliminar columna

### Tarjetas

- `POST /api/columns/:id/cards` - Crear tarjeta
- `PUT /api/cards/:id` - Actualizar tarjeta
- `DELETE /api/cards/:id` - Eliminar tarjeta
- `POST /api/cards/:id/move` - Mover tarjeta

### Exportación

- `POST /api/export/backlog` - Exportar backlog
- `GET /api/export/health` - Verificar estado N8N

## 🌐 WebSocket Events

### Cliente → Servidor

- `join-board` - Unirse a un tablero
- `leave-board` - Salir de un tablero
- `board:update` - Actualizar tablero

### Servidor → Cliente

- `board:updated` - Tablero actualizado
- `card:created` - Tarjeta creada
- `card:updated` - Tarjeta actualizada
- `card:deleted` - Tarjeta eliminada
- `card:moved` - Tarjeta movida
- `column:created` - Columna creada
- `column:updated` - Columna actualizada
- `column:deleted` - Columna eliminada

## 🐳 Docker Compose

El archivo `docker-compose.yml` incluye:

```yaml
services:
  mongodb: # Base de datos MongoDB
  n8n: # Automatización de workflows
```

### Comandos Docker

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Reiniciar servicios
docker-compose restart
```

## 📝 Scripts Disponibles

### Backend

- `npm run start:dev` - Desarrollo con hot reload
- `npm run build` - Compilar
- `npm run start:prod` - Ejecutar en producción
- `npm run seed` - Poblar base de datos

### Frontend

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Compilar
- `npm run lint` - Linter

## 🛠️ Solución de Problemas

### Error: "MongoDB connection failed"

```bash
# Verificar que MongoDB esté corriendo
docker-compose ps mongodb
docker-compose logs mongodb
```

### Error: "N8N webhook not found"

1. Verifica que N8N esté corriendo: `http://localhost:5678`
2. Confirma que el workflow esté activo
3. Revisa las credenciales SMTP

### Error: "Email not sent"

1. Verifica la App Password de Gmail
2. Confirma que 2FA esté habilitado
3. Revisa los logs de N8N

### Error: "WebSocket connection failed"

1. Verifica que el backend esté corriendo en puerto 3000
2. Confirma que no haya firewall bloqueando
3. Revisa la configuración CORS

## 📞 Soporte

Para problemas o preguntas:

1. Revisa la documentación en `n8n/setup-instructions.md`
2. Verifica los logs de Docker Compose
3. Confirma la configuración de variables de entorno
4. Revisa la documentación de N8N: https://docs.n8n.io/

## 🎯 Funcionalidades Implementadas

### ✅ Completadas

- [x] Tablero Kanban con drag & drop
- [x] Colaboración en tiempo real
- [x] Gestión CRUD completa
- [x] Exportación de backlog vía email
- [x] Interfaz moderna y responsive
- [x] Tema claro/oscuro
- [x] Docker Compose setup
- [x] Workflow N8N automatizado

### 🔄 Flujo de Exportación

```
Usuario → Frontend → Backend → N8N → Gmail → Usuario
```

1. Usuario hace clic en "Export Backlog"
2. Frontend envía datos al backend
3. Backend procesa y envía a N8N
4. N8N genera CSV y envía por email
5. Usuario recibe confirmación y archivo

## 🏆 Evaluación

Este proyecto demuestra:

- **Pensamiento asincrónico** con WebSocket y manejo de eventos
- **Lógica compleja en frontend** con drag & drop y estado compartido
- **Gestión de eventos** y sincronización entre usuarios
- **Automatización** con N8N y workflows
- **Código limpio** y modular
- **Documentación completa** y setup automatizado

¡El proyecto está **100% completo** y listo para producción! 🚀

---

**Desarrollado usando React.js, NestJS y N8N**
