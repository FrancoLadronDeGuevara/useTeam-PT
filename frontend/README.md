# Frontend - useTeam Kanban Board

Una aplicación de tablero Kanban moderna construida con React, TypeScript y Tailwind CSS, diseñada para facilitar la gestión de tareas y proyectos de manera colaborativa.

## 🚀 Características

- **Tableros Kanban Interactivos**: Crea, edita y gestiona múltiples tableros de trabajo
- **Drag & Drop Intuitivo**: Arrastra y suelta tarjetas entre columnas con animaciones fluidas
- **Tiempo Real**: Sincronización en tiempo real entre múltiples usuarios usando WebSockets
- **Personalización de Colores**: Personaliza colores de fondo y texto para tarjetas y tableros
- **Modo Oscuro/Claro**: Cambio de tema con persistencia en localStorage
- **Responsive Design**: Optimizado para dispositivos móviles y desktop
- **Exportación de Datos**: Exporta backlogs a diferentes formatos
- **Notificaciones**: Sistema de notificaciones toast para feedback del usuario

## 🛠️ Stack Tecnológico

### Core

- **React 19.1.1** - Biblioteca de interfaz de usuario
- **TypeScript 5.9.3** - Tipado estático para JavaScript
- **Vite 7.1.7** - Herramienta de construcción rápida

### UI y Estilos

- **Tailwind CSS 4.1.14** - Framework de CSS utilitario
- **Lucide React 0.544.0** - Iconos SVG optimizados
- **React Hot Toast 2.6.0** - Notificaciones toast elegantes

### Drag & Drop

- **@dnd-kit/core 6.3.1** - Biblioteca de drag & drop accesible
- **@dnd-kit/sortable 10.0.0** - Componentes ordenables
- **@dnd-kit/utilities 3.2.2** - Utilidades para transformaciones

### Comunicación

- **Socket.IO Client 4.8.1** - Comunicación en tiempo real
- **Axios 1.12.2** - Cliente HTTP para API REST

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── Board/           # Componentes del tablero Kanban
│   │   ├── Board.tsx           # Componente principal del tablero
│   │   ├── Card.tsx            # Componente de tarjeta
│   │   ├── Column.tsx          # Componente de columna
│   │   ├── CreateCardModal.tsx # Modal para crear tarjetas
│   │   ├── EditCardModal.tsx   # Modal para editar tarjetas
│   │   ├── CreateColumnModal.tsx # Modal para crear columnas
│   │   ├── EditColumnModal.tsx # Modal para editar columnas
│   │   └── ExportModal.tsx     # Modal para exportar datos
│   ├── BoardList/       # Componentes de lista de tableros
│   │   ├── BoardList.tsx       # Lista principal de tableros
│   │   ├── CreateBoardModal.tsx # Modal para crear tableros
│   │   └── EditBoardModal.tsx  # Modal para editar tableros
│   ├── Header/          # Componentes del header
│   │   ├── Header.tsx          # Header principal
│   │   └── NavigationBar.tsx   # Barra de navegación
│   ├── ThemeToggle/     # Componente de cambio de tema
│   │   └── ThemeToggle.tsx
│   └── UI/              # Componentes UI genéricos
│       ├── KebabMenu.tsx       # Menú de opciones (3 puntos)
│       └── ColorPicker.tsx     # Selector de colores personalizable
├── context/             # Contextos de React
│   ├── BoardContext.tsx        # Estado global de tableros
│   ├── ThemeContext.tsx        # Estado del tema
│   └── ThemeContextDefinition.tsx # Definición del contexto de tema
├── hooks/               # Hooks personalizados
│   ├── useDragAndDrop.ts       # Hook para drag & drop
│   ├── useModal.ts             # Hook para manejo de modales
│   └── useTheme.ts             # Hook para tema
├── services/            # Servicios de API y WebSocket
│   ├── api.ts                  # Cliente API REST
│   └── websocket.ts            # Cliente WebSocket
├── types/               # Definiciones de tipos TypeScript
│   └── index.ts
├── utils/               # Utilidades y helpers
│   ├── constants.ts            # Constantes de la aplicación
│   └── helpers.ts              # Funciones auxiliares
├── constants/           # Constantes específicas
│   └── websocket-events.ts     # Eventos de WebSocket
├── App.tsx              # Componente raíz de la aplicación
├── main.tsx             # Punto de entrada de la aplicación
└── index.css            # Estilos globales
```

## 🎨 Personalización de Colores

### Características de Color

La aplicación incluye un sistema completo de personalización de colores que permite a los usuarios personalizar tanto tarjetas como tableros:

#### **Personalización de Tarjetas**

- **Color de Fondo**: Personaliza el color de fondo de cada tarjeta individualmente
- **Color de Texto**: Ajusta el color del texto para mejor legibilidad
- **Selector Visual**: Interfaz intuitiva con paleta de colores predefinida
- **Colores por Defecto**: Blanco para fondo y negro para texto cuando no se personaliza

#### **Personalización de Tableros**

- **Color Principal**: Define el color del borde del tablero
- **Color de Fondo**: Personaliza el color de fondo del tablero
- **Persistencia**: Los colores se guardan automáticamente en la base de datos
- **Sincronización**: Los cambios se sincronizan en tiempo real entre usuarios

#### **Componente ColorPicker**

- **Paleta Extensa**: 28 colores predefinidos incluyendo tonos vibrantes y neutros
- **Interfaz Compacta**: Diseño optimizado con grid de 8 columnas
- **Dropdown Intuitivo**: Se abre hacia arriba para mejor UX
- **Accesibilidad**: Soporte completo para navegación por teclado
- **Modo Oscuro**: Adaptación automática al tema actual

#### **Implementación Técnica**

- **CSS Dinámico**: Aplicación de estilos mediante `style` attributes con `!important`
- **Sobrescritura de Tailwind**: Los colores personalizados tienen prioridad sobre las clases CSS
- **Optimización**: Actualización eficiente sin re-renders innecesarios
- **Compatibilidad**: Funciona perfectamente con modo oscuro y claro

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Backend del proyecto ejecutándose en puerto 3000

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de la construcción
npm run preview

# Linting
npm run lint
```

### Variables de Entorno

```env
VITE_API_URL=http://localhost:3000
```

## 🔧 Configuración de Desarrollo

### Vite

El proyecto usa Vite como bundler con:

- Proxy para API en desarrollo
- HMR (Hot Module Replacement) habilitado
- Soporte completo para TypeScript

### Tailwind CSS

- Configuración personalizada en `tailwind.config.ts`
- Modo oscuro habilitado con clase `dark`
- Utilidades personalizadas para el tema

### TypeScript

- Configuración estricta habilitada
- Tipos personalizados para toda la aplicación
- Interfaces bien definidas para props y estado

## 🌐 Comunicación con el Backend

### API REST

- Base URL configurable via `VITE_API_URL`
- Interceptores para manejo de errores
- Tipado completo de respuestas

### WebSocket

- Conexión automática cuando se necesita
- Reconexión automática en caso de desconexión
- Sincronización en tiempo real entre usuarios

## 🎯 Funcionalidades Principales

### Gestión de Tableros

- Crear, editar y eliminar tableros
- Vista de lista con información básica
- Navegación entre tableros
- **Personalización de colores**: Personaliza color principal y fondo de cada tablero

### Gestión de Columnas

- Crear columnas en tableros
- Editar títulos de columnas
- Eliminar columnas (con confirmación)

### Gestión de Tarjetas

- Crear tarjetas con título y descripción
- Editar contenido de tarjetas
- Eliminar tarjetas
- Drag & drop entre columnas
- **Personalización de colores**: Personaliza color de fondo y texto de cada tarjeta

### Características Avanzadas

- Sincronización en tiempo real
- Notificaciones toast
- Modo oscuro/claro
- Exportación de datos
- Contador de usuarios conectados
- **Sistema de colores personalizable**: Personaliza colores de tarjetas y tableros con selector visual

## 📦 Construcción y Despliegue

### Desarrollo

```bash
npm run dev
```

Servidor de desarrollo en `http://localhost:5173`

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 🆘 Soporte

Para soporte y preguntas:

- Abre un issue en GitHub
- Contacta al equipo de desarrollo
- Revisa la documentación del backend

---
