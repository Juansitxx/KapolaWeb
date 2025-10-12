# 🍪 Galletas App - E-commerce Completo

Aplicación completa de e-commerce para venta de galletas artesanales, desarrollada con **Node.js**, **React** y **PostgreSQL**.

## 🚀 Características Principales

### Backend (API REST)
- **Node.js + Express.js** - Servidor robusto
- **PostgreSQL + Prisma** - Base de datos relacional
- **JWT Authentication** - Autenticación segura
- **Multer** - Subida de archivos
- **Validaciones** - Middleware personalizado
- **Manejo de errores** - Centralizado

### Frontend (React)
- **React 18 + TypeScript** - Frontend moderno
- **Material-UI** - Componentes elegantes
- **React Router** - Navegación SPA
- **Context API** - Manejo de estado
- **Axios** - Cliente HTTP
- **Responsive Design** - Móvil y desktop

## 📋 Funcionalidades

### ✅ Implementadas
- **Autenticación completa** (registro, login, JWT)
- **Gestión de productos** (CRUD, categorías, búsqueda)
- **Carrito de compras** (agregar, actualizar, eliminar)
- **Sistema de órdenes** (crear, estados, historial)
- **Panel de administración** (usuarios, productos, órdenes)
- **Búsqueda avanzada** (filtros, sugerencias)
- **Subida de imágenes** (productos)
- **API completa** (REST, documentada)

### 🚧 En Desarrollo
- Sistema de pagos
- Notificaciones en tiempo real
- Reviews de productos
- Descuentos y cupones
- Reportes avanzados

## 🛠️ Tecnologías

### Backend
- Node.js 18+
- Express.js 5.x
- PostgreSQL 13+
- Prisma ORM
- JWT + bcrypt
- Multer
- CORS

### Frontend
- React 18
- TypeScript
- Material-UI 5
- React Router 6
- Axios
- Context API

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL 13+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd galletas-app
```

### 2. Configurar Backend
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# Configurar base de datos
npx prisma migrate dev
npx prisma generate
npm run db:seed

# Iniciar servidor
npm run dev
```

### 3. Configurar Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de la API

# Iniciar aplicación
npm start
```

### 4. Inicio Rápido (Ambos)
```bash
# Windows
start-dev.bat

# Linux/Mac
chmod +x start-dev.sh
./start-dev.sh
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/api/health
- **API Docs**: http://localhost:4000/api/info

## 🔑 Credenciales de Prueba

### Usuarios
- **Admin**: `admin@galletas.com` / `admin123`
- **Cliente**: `juan@ejemplo.com` / `cliente123`

### Productos
- 8 productos de ejemplo con diferentes categorías
- Imágenes de galletas de Unsplash
- Precios y stock realistas

## 📁 Estructura del Proyecto

```
galletas-app/
├── src/                    # Backend
│   ├── controllers/        # Controladores de API
│   ├── middleware/         # Middlewares personalizados
│   ├── routes/            # Rutas de la API
│   ├── services/          # Servicios (email, upload)
│   ├── contexts/          # Contextos de autenticación
│   ├── seeders/           # Datos de prueba
│   └── index.js           # Servidor principal
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas de la app
│   │   ├── contexts/      # Contextos de React
│   │   ├── services/      # Servicios de API
│   │   └── types/         # Tipos TypeScript
│   └── public/            # Archivos estáticos
├── prisma/                # Esquema de base de datos
├── uploads/               # Archivos subidos
└── docs/                  # Documentación
```

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev          # Servidor de desarrollo
npm start            # Servidor de producción
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Poblar con datos de prueba
npm run db:reset     # Resetear base de datos
npm run db:studio    # Abrir Prisma Studio
```

### Frontend
```bash
npm start            # Servidor de desarrollo
npm run build        # Construir para producción
npm test             # Ejecutar tests
```

## 📊 API Endpoints

### Autenticación
- `POST /api/users/register` - Registro
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Perfil

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Producto específico
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Carrito
- `GET /api/cart` - Obtener carrito
- `POST /api/cart/add` - Agregar al carrito
- `PUT /api/cart/items/:id` - Actualizar cantidad
- `DELETE /api/cart/items/:id` - Eliminar del carrito

### Órdenes
- `GET /api/orders` - Listar órdenes
- `POST /api/orders` - Crear orden
- `GET /api/orders/:id` - Orden específica
- `PUT /api/orders/:id/status` - Actualizar estado

### Búsqueda
- `GET /api/search/products` - Búsqueda avanzada
- `GET /api/search/suggestions` - Sugerencias
- `GET /api/search/products/popular` - Productos populares

### Administración
- `GET /api/admin/dashboard` - Estadísticas
- `GET /api/admin/users` - Gestión de usuarios
- `GET /api/admin/orders` - Todas las órdenes

## 🎨 Diseño y UX

- **Tema personalizado** con colores de galletas
- **Responsive design** para todos los dispositivos
- **Componentes reutilizables** con Material-UI
- **Navegación intuitiva** con React Router
- **Estados de carga** y manejo de errores
- **Animaciones suaves** y transiciones

## 🔒 Seguridad

- **JWT tokens** para autenticación
- **Bcrypt** para encriptación de contraseñas
- **Validaciones** en frontend y backend
- **CORS** configurado correctamente
- **Sanitización** de inputs
- **Rate limiting** (pendiente)

## 🚀 Despliegue

### Backend (Railway/Heroku)
```bash
# Configurar variables de entorno
DATABASE_URL=postgresql://...
JWT_SECRET=tu_secret_seguro
NODE_ENV=production

# Deploy
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
# Configurar variables de entorno
REACT_APP_API_URL=https://tu-api.herokuapp.com/api

# Deploy
npm run build
# Subir carpeta build/
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Juan** - *Desarrollo completo* - [@juan](https://github.com/juan)

## 🙏 Agradecimientos

- Material-UI por los componentes
- Unsplash por las imágenes de galletas
- Prisma por el ORM
- React por el framework

---

**¡Disfruta de las mejores galletas! 🍪**

