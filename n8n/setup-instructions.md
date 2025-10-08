# 📋 Guía Completa de Configuración N8N - Sistema de Exportación Kanban

Esta guía te ayudará a configurar completamente N8N para el sistema de exportación automática de tableros Kanban, incluyendo la configuración de SMTP, resolución de errores comunes y optimización del flujo de trabajo.

## 📋 Tabla de Contenidos

1. [Requisitos del Sistema](#-requisitos-del-sistema)
2. [Instalación y Configuración](#-instalación-y-configuración)
3. [Configuración de SMTP](#-configuración-de-smtp)
4. [Configuración del Workflow](#-configuración-del-workflow)
5. [Variables de Entorno](#-variables-de-entorno)
6. [Configuración del Backend](#-configuración-del-backend)
7. [Pruebas y Validación](#-pruebas-y-validación)
8. [Resolución de Problemas](#-resolución-de-problemas)
9. [Optimización y Mantenimiento](#-optimización-y-mantenimiento)
10. [Seguridad](#-seguridad)

---

## 🖥️ Requisitos del Sistema

### Requisitos Mínimos

- **Sistema Operativo**: Linux (Ubuntu 20.04+), macOS, o Windows 10+
- **RAM**: Mínimo 2GB, recomendado 4GB+
- **CPU**: 2 cores mínimo
- **Almacenamiento**: 10GB de espacio libre
- **Red**: Acceso a internet para descargar dependencias

### Software Requerido

- **Node.js**: v18.0.0 o superior
- **npm**: v8.0.0 o superior
- **Docker**: v20.0.0 o superior (opcional pero recomendado)
- **Docker Compose**: v2.0.0 o superior
- **MongoDB**: v6.0+ (si no usas Docker)

### Dependencias del Proyecto

- **Backend**: NestJS v11.0.1
- **Base de datos**: MongoDB v7.0
- **N8N**: v1.106.3
- **Librerías**: axios, mongoose, socket.io

---

## 🚀 Instalación y Configuración

### Opción 1: Instalación con Docker (Recomendada)

#### 1.1 Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd useTeam-PT
```

#### 1.2 Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# Base de datos
MONGODB_URI=mongodb://mongodb:27017/kanban-board

# Backend
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# N8N
N8N_WEBHOOK_URL=http://localhost:5678/webhook/kanban-export
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_EDITOR_BASE_URL=http://localhost:5678

# SMTP (Gmail - ver configuración detallada abajo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=tu-email@gmail.com
```

#### 1.3 Iniciar Servicios

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar estado
docker-compose ps
```

### Opción 2: Instalación Manual

#### 2.1 Instalar N8N Globalmente

```bash
npm install n8n -g
```

#### 2.2 Instalar Dependencias del Backend

```bash
cd backend
npm install
```

#### 2.3 Configurar MongoDB

```bash
# Instalar MongoDB (Ubuntu/Debian)
sudo apt update
sudo apt install mongodb

# Iniciar MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### 2.4 Iniciar Servicios

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: N8N
n8n start
```

---

## 📧 Configuración de SMTP

### Gmail SMTP (Recomendado)

#### 3.1 Habilitar Autenticación de 2 Factores

1. Ve a [Google Account Security](https://myaccount.google.com/security)
2. Activa la **Verificación en 2 pasos**
3. Ve a **Contraseñas de aplicaciones**
4. Genera una nueva contraseña para "N8N"

#### 3.2 Configurar Credenciales en N8N

1. Accede a N8N: `http://localhost:5678`
2. Ve a **Settings** → **Credentials**
3. Crea nueva credencial **SMTP**:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: tu-email@gmail.com
   Password: tu-app-password (16 caracteres)
   Security: STARTTLS
   ```

#### 3.3 Configuración Alternativa (OAuth2)

Para mayor seguridad, puedes usar OAuth2:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Gmail API**
4. Crea credenciales OAuth2
5. Configura en N8N usando OAuth2

### Otros Proveedores SMTP

#### Outlook/Hotmail

```
Host: smtp-mail.outlook.com
Port: 587
Security: STARTTLS
```

#### Yahoo Mail

```
Host: smtp.mail.yahoo.com
Port: 587
Security: STARTTLS
```

#### SendGrid (Recomendado para Producción)

```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: tu-sendgrid-api-key
```

---

## ⚙️ Configuración del Workflow

### 4.1 Importar el Workflow

1. Accede a N8N: `http://localhost:5678`
2. Haz clic en **Workflows** → **Import from File**
3. Selecciona el archivo `workflow.json`
4. El workflow se importará automáticamente

### 4.2 Configurar Nodos del Workflow

#### Webhook Trigger

- **Path**: `kanban-export`
- **Method**: POST
- **Response Mode**: Response Node
- **Response Node**: Respuesta Webhook

#### HTTP Request (Obtener Columnas)

- **URL**: `http://172.18.0.1:3000/api/export/columns`
- **Method**: GET
- **Headers**: `Content-Type: application/json`

#### Code Node (Procesar Tarjetas)

El código JavaScript procesa las columnas y tarjetas:

```javascript
const outputCards = [];

for (const item of items) {
  const column = item.json;

  if (column.cards && Array.isArray(column.cards)) {
    for (const card of column.cards) {
      let formattedDate = "";
      if (card.createdAt) {
        try {
          const date = new Date(card.createdAt);
          formattedDate = date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch (error) {
          formattedDate = String(card.createdAt);
        }
      }

      outputCards.push({
        json: {
          id: card._id,
          title: card.title || "",
          description: card.description || "",
          column: column.name,
          boardTitle: column.boardTitle,
          createdAt: formattedDate,
        },
      });
    }
  }
}

return outputCards;
```

#### Convert to File (CSV)

- **File Name**: `=kanban-export-{{ new Date().toISOString().split('T')[0] }}.csv`
- **Delimiter**: `,`
- **Header Row**: `true`

#### Email Send

- **From**: `tu-email@gmail.com`
- **To**: `={{ $json.recipientEmail || 'tu-email@gmail.com' }}`
- **Subject**: `📋 Exportación Kanban - Tablero Completado`
- **HTML**: [Ver template completo en workflow.json]

### 4.3 Activar el Workflow

1. Haz clic en el toggle de activación
2. Verifica que el estado sea **Active**
3. Copia la URL del webhook: `http://localhost:5678/webhook/kanban-export`

---

## 🔧 Variables de Entorno

### Backend (.env)

```bash
# Base de datos
MONGODB_URI=mongodb://localhost:27017/kanban-board

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# N8N
N8N_WEBHOOK_URL=http://localhost:5678/webhook/kanban-export
```

### N8N (Docker)

```bash
# N8N Configuration
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_EDITOR_BASE_URL=http://localhost:5678

# Database (opcional)
DB_TYPE=sqlite
DB_SQLITE_DATABASE=/home/node/.n8n/database.sqlite

# Security
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=tu-password-segura

# Webhook
WEBHOOK_URL=http://localhost:5678/
```

---

## 🖥️ Configuración del Backend

### 5.1 Estructura del Proyecto

```
backend/
├── src/
│   ├── export/
│   │   ├── export.controller.ts
│   │   ├── export.service.ts
│   │   ├── export.module.ts
│   │   └── dto/
│   │       └── export.dto.ts
│   ├── board/
│   ├── config/
│   └── main.ts
├── package.json
└── tsconfig.json
```

### 5.2 Endpoints Disponibles

- `POST /api/export/backlog` - Iniciar exportación
- `GET /api/export/columns` - Obtener todas las columnas
- `GET /api/export/health` - Verificar estado de N8N
- `POST /api/export/confirm` - Confirmar exportación

### 5.3 Ejemplo de Uso

```bash
# Exportar tablero
curl -X POST http://localhost:3000/api/export/backlog \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": "68e2f9c17de6426cd16ffe50",
    "recipientEmail": "usuario@ejemplo.com",
    "fields": ["id", "title", "description", "column", "createdAt"]
  }'

# Verificar salud del sistema
curl http://localhost:3000/api/export/health
```

---

## 🧪 Pruebas y Validación

### 6.1 Verificar Servicios

```bash
# Backend
curl http://localhost:3000/api/export/health

# N8N
curl http://localhost:5678

# MongoDB
mongosh mongodb://localhost:27017/kanban-board
```

### 6.2 Probar Workflow

1. **Crear tablero de prueba** en el frontend
2. **Agregar tarjetas** a diferentes columnas
3. **Ejecutar exportación** desde el frontend
4. **Verificar email** recibido
5. **Revisar logs** de N8N y backend

### 6.3 Logs de Depuración

```bash
# Backend logs
docker-compose logs -f backend

# N8N logs
docker-compose logs -f n8n

# MongoDB logs
docker-compose logs -f mongodb
```

---

## 🔧 Resolución de Problemas

### 7.1 Errores Comunes

#### Error: "No Respond to Webhook node found"

**Causa**: El nodo de respuesta no está configurado correctamente
**Solución**:

1. Verifica que el nodo "Respuesta Webhook" existe
2. Configura `responseNode: "Respuesta Webhook"` en el webhook trigger
3. Asegúrate de que el workflow esté activo

#### Error: "Failed to communicate with N8N service"

**Causa**: N8N no está ejecutándose o la URL es incorrecta
**Solución**:

1. Verifica que N8N esté corriendo: `docker-compose ps`
2. Comprueba la URL: `http://localhost:5678`
3. Revisa las variables de entorno

#### Error: "SMTP Authentication failed"

**Causa**: Credenciales SMTP incorrectas
**Solución**:

1. Verifica el email y contraseña de aplicación
2. Asegúrate de que la verificación en 2 pasos esté activada
3. Usa contraseñas de aplicación, no la contraseña normal

#### Error: "MongoDB connection failed"

**Causa**: MongoDB no está ejecutándose
**Solución**:

1. Inicia MongoDB: `docker-compose up -d mongodb`
2. Verifica la URI de conexión
3. Revisa los logs: `docker-compose logs mongodb`

### 7.2 Debugging Avanzado

#### Habilitar Logs Detallados

```bash
# Backend con debug
NODE_ENV=development DEBUG=* npm run start:dev

# N8N con debug
N8N_LOG_LEVEL=debug n8n start
```

#### Verificar Conectividad

```bash
# Test webhook
curl -X POST http://localhost:5678/webhook/kanban-export \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test backend
curl http://localhost:3000/api/export/columns
```

### 7.3 Problemas de Red

#### Docker Networking

```bash
# Verificar redes
docker network ls
docker network inspect kanban-network

# Conectar contenedores
docker network connect kanban-network tu-contenedor
```

#### Firewall

```bash
# Ubuntu/Debian
sudo ufw allow 3000
sudo ufw allow 5678
sudo ufw allow 27017

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=5678/tcp
sudo firewall-cmd --reload
```

---

## ⚡ Optimización y Mantenimiento

### 8.1 Optimización de Rendimiento

#### N8N

```bash
# Variables de entorno para optimización
N8N_METRICS=true
N8N_DIAGNOSTICS_ENABLED=true
N8N_LOG_LEVEL=info
```

#### Backend

```bash
# Variables de optimización
NODE_OPTIONS="--max-old-space-size=4096"
UV_THREADPOOL_SIZE=32
```

### 8.2 Monitoreo

#### Health Checks

```bash
# Script de monitoreo
#!/bin/bash
curl -f http://localhost:3000/api/export/health || echo "Backend down"
curl -f http://localhost:5678 || echo "N8N down"
```

#### Logs Rotativos

```bash
# Configurar logrotate
sudo nano /etc/logrotate.d/kanban-system
```

### 8.3 Backup y Recuperación

#### Backup de N8N

```bash
# Backup de workflows
docker exec kanban-n8n n8n export:workflow --backup --output=/tmp/backup.json

# Backup de base de datos
docker exec kanban-mongodb mongodump --out /tmp/mongodb-backup
```

#### Restauración

```bash
# Restaurar workflows
docker exec kanban-n8n n8n import:workflow --input=/tmp/backup.json

# Restaurar base de datos
docker exec kanban-mongodb mongorestore /tmp/mongodb-backup
```

---

## 🔒 Seguridad

### 9.1 Configuración de Seguridad

#### N8N

```bash
# Variables de seguridad
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=password-segura
N8N_JWT_SECRET=tu-jwt-secret-muy-largo
```

#### Backend

```bash
# Variables de seguridad
JWT_SECRET=tu-jwt-secret
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### 9.2 Certificados SSL

#### Let's Encrypt (Producción)

```bash
# Instalar certbot
sudo apt install certbot

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com

# Configurar N8N con SSL
N8N_PROTOCOL=https
N8N_SSL_KEY=/etc/letsencrypt/live/tu-dominio.com/privkey.pem
N8N_SSL_CERT=/etc/letsencrypt/live/tu-dominio.com/fullchain.pem
```

### 9.3 Firewall y Red

#### Configuración de Firewall

```bash
# Reglas básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3000
sudo ufw allow 5678
sudo ufw enable
```

---

## 📊 Monitoreo y Alertas

### 10.1 Métricas del Sistema

#### Prometheus + Grafana

```yaml
# docker-compose.monitoring.yml
version: "3.8"
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### 10.2 Alertas por Email

#### Configurar Alertas

```bash
# Script de alertas
#!/bin/bash
if ! curl -f http://localhost:3000/api/export/health; then
    echo "Sistema Kanban caído" | mail -s "ALERTA: Sistema Down" admin@tu-dominio.com
fi
```

---

## 🚀 Despliegue en Producción

### 11.1 Configuración de Producción

#### Variables de Entorno

```bash
# .env.production
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/kanban-board-prod
N8N_WEBHOOK_URL=https://tu-dominio.com/webhook/kanban-export
FRONTEND_URL=https://tu-dominio.com
```

#### Docker Compose para Producción

```yaml
# docker-compose.prod.yml
version: "3.8"
services:
  n8n:
    image: n8nio/n8n:1.106.3
    restart: always
    environment:
      - N8N_PROTOCOL=https
      - N8N_EDITOR_BASE_URL=https://tu-dominio.com
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - kanban-network
```

### 11.2 CI/CD Pipeline

#### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Soporte y Contacto

### 12.1 Recursos Útiles

- [Documentación N8N](https://docs.n8n.io/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

### 12.2 Logs y Debugging

- **Backend Logs**: `docker-compose logs backend`
- **N8N Logs**: `docker-compose logs n8n`
- **MongoDB Logs**: `docker-compose logs mongodb`

### 12.3 Comandos Útiles

```bash
# Reiniciar servicios
docker-compose restart

# Ver estado
docker-compose ps

# Limpiar volúmenes
docker-compose down -v

# Actualizar imágenes
docker-compose pull
docker-compose up -d
```

---

## ✅ Checklist de Configuración

### Instalación Inicial

- [ ] Node.js v18+ instalado
- [ ] Docker y Docker Compose instalados
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas
- [ ] Servicios iniciados correctamente

### Configuración N8N

- [ ] N8N accesible en http://localhost:5678
- [ ] Workflow importado correctamente
- [ ] Credenciales SMTP configuradas
- [ ] Workflow activado
- [ ] Webhook URL verificada

### Configuración Backend

- [ ] Backend ejecutándose en puerto 3000
- [ ] MongoDB conectado
- [ ] Endpoints respondiendo correctamente
- [ ] Variables N8N_WEBHOOK_URL configuradas

### Pruebas

- [ ] Exportación funciona desde frontend
- [ ] Email se envía correctamente
- [ ] Archivo CSV se genera
- [ ] Logs sin errores críticos

### Producción

- [ ] SSL configurado
- [ ] Firewall configurado
- [ ] Backup configurado
- [ ] Monitoreo configurado
- [ ] Alertas configuradas

---

**¡Felicitaciones! 🎉 Tu sistema de exportación Kanban con N8N está listo para usar.**

Para cualquier problema o pregunta, revisa la sección de resolución de problemas o consulta los logs del sistema.
