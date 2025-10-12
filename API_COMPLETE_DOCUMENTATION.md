# Galletas App - API Completa

## 🚀 Descripción
API REST completa para una aplicación de e-commerce de galletas con funcionalidades avanzadas de gestión, búsqueda, carrito de compras y administración.

## 🛠️ Tecnologías
- **Backend**: Node.js + Express.js
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticación**: JWT (JSON Web Tokens)
- **Seguridad**: bcrypt para encriptación
- **Archivos**: Multer para subida de imágenes
- **Validación**: Middleware personalizado

## 📋 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crear archivo `.env`:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/galletas_db"
JWT_SECRET="tu_jwt_secret_muy_seguro_aqui"
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EMAIL_FROM=noreply@galletasapp.com
EMAIL_ENABLED=true
```

### 3. Configurar base de datos
```bash
# Generar cliente de Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Poblar con datos de prueba
npm run db:seed
```

### 4. Iniciar servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Endpoints de la API

### 🔐 Autenticación

#### POST /api/users/register
Registrar nuevo usuario
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "123456"
}
```

#### POST /api/users/login
Iniciar sesión
```json
{
  "email": "juan@ejemplo.com",
  "password": "123456"
}
```

#### GET /api/users/profile
Obtener perfil del usuario (requiere token)

### 🍪 Productos

#### GET /api/products
Obtener productos con filtros
- Query params: `category`, `active`, `page`, `limit`
- Ejemplo: `/api/products?category=Chocolate&page=1&limit=10`

#### GET /api/products/categories
Obtener categorías disponibles

#### GET /api/products/:id
Obtener producto específico

#### POST /api/products
Crear producto (requiere autenticación)
```json
{
  "name": "Galletas de Chocolate",
  "description": "Deliciosas galletas",
  "price": 15.99,
  "stock": 100,
  "imageUrl": "https://ejemplo.com/imagen.jpg",
  "category": "Chocolate"
}
```

#### PUT /api/products/:id
Actualizar producto (requiere autenticación)

#### DELETE /api/products/:id
Eliminar producto (requiere autenticación)

### 🛒 Carrito de Compras

#### GET /api/cart
Obtener carrito del usuario (requiere autenticación)

#### POST /api/cart/add
Agregar producto al carrito
```json
{
  "productId": 1,
  "quantity": 2
}
```

#### PUT /api/cart/items/:itemId
Actualizar cantidad en el carrito
```json
{
  "quantity": 3
}
```

#### DELETE /api/cart/items/:itemId
Eliminar item del carrito

#### DELETE /api/cart/clear
Limpiar carrito completo

### 📦 Órdenes

#### GET /api/orders
Obtener órdenes del usuario (requiere autenticación)
- Query params: `page`, `limit`, `status`

#### GET /api/orders/:id
Obtener orden específica (requiere autenticación)

#### POST /api/orders
Crear nueva orden
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "paymentMethod": "tarjeta"
}
```

#### PUT /api/orders/:id/status
Actualizar estado de orden
```json
{
  "status": "confirmada"
}
```

#### PUT /api/orders/:id/cancel
Cancelar orden

### 🔍 Búsqueda

#### GET /api/search/products
Búsqueda avanzada de productos
- Query params: `q`, `category`, `minPrice`, `maxPrice`, `inStock`, `sortBy`, `sortOrder`

#### GET /api/search/products/popular
Obtener productos populares

#### GET /api/search/products/:id/related
Obtener productos relacionados

#### GET /api/search/suggestions
Obtener sugerencias de búsqueda
- Query param: `q`

### 📁 Subida de Archivos

#### POST /api/upload/products/:productId/image
Subir imagen de producto (requiere autenticación)
- Form data: `image` (archivo)

#### DELETE /api/upload/products/:productId/image
Eliminar imagen de producto (requiere autenticación)

#### GET /api/upload/products/:productId/image
Obtener URL de imagen de producto

### 👨‍💼 Administración

#### GET /api/admin/dashboard
Obtener estadísticas del dashboard (solo admin)

#### GET /api/admin/users
Obtener todos los usuarios (solo admin)
- Query params: `page`, `limit`, `role`, `search`

#### PUT /api/admin/users/:id/role
Actualizar rol de usuario (solo admin)
```json
{
  "role": "admin"
}
```

#### DELETE /api/admin/users/:id
Eliminar usuario (solo admin)

#### GET /api/admin/orders
Obtener todas las órdenes (solo admin)
- Query params: `page`, `limit`, `status`, `userId`, `startDate`, `endDate`

#### PUT /api/admin/orders/:id/status
Actualizar estado de orden (solo admin)

### 📊 Utilidades

#### GET /api/health
Verificar estado del servidor

#### GET /api/info
Información de la API

## 🔒 Autenticación

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

## 📝 Estados de Orden
- `pendiente`: Orden creada, esperando confirmación
- `confirmada`: Orden confirmada por el usuario
- `en_proceso`: Orden siendo preparada
- `enviada`: Orden enviada
- `entregada`: Orden entregada
- `cancelada`: Orden cancelada

## 👥 Roles de Usuario
- `cliente`: Usuario regular
- `admin`: Administrador del sistema

## 🏷️ Categorías de Productos
- Chocolate
- Vainilla
- Avena
- Mantequilla
- Frutas
- Especiales

## 📊 Respuestas de Error

### Formato estándar
```json
{
  "message": "Descripción del error",
  "errors": ["Lista de errores específicos"]
}
```

### Códigos de Estado HTTP
- `200`: Éxito
- `201`: Creado exitosamente
- `400`: Error de validación
- `401`: No autorizado
- `403`: Acceso denegado
- `404`: No encontrado
- `500`: Error interno del servidor

## 🧪 Datos de Prueba

### Usuarios de prueba
- **Admin**: admin@galletas.com / admin123
- **Cliente**: juan@ejemplo.com / cliente123

### Productos de prueba
El seeder incluye 8 productos de ejemplo con diferentes categorías.

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Producción
npm start

# Base de datos
npm run db:migrate    # Ejecutar migraciones
npm run db:generate   # Generar cliente Prisma
npm run db:seed       # Poblar con datos de prueba
npm run db:reset      # Resetear y poblar BD
npm run db:studio     # Abrir Prisma Studio
```

## 📁 Estructura del Proyecto

```
src/
├── config/
│   ├── prisma.js
│   └── frontendConfig.js
├── controllers/
│   ├── userController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── adminController.js
│   ├── searchController.js
│   ├── cartController.js
│   └── uploadController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── validationMiddleware.js
│   └── errorMiddleware.js
├── routes/
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   ├── adminRoutes.js
│   ├── searchRoutes.js
│   ├── cartRoutes.js
│   └── uploadRoutes.js
├── services/
│   ├── emailService.js
│   └── fileUploadService.js
├── seeders/
│   └── seedData.js
└── index.js
```

## 🔧 Configuración para Frontend

### Variables de entorno recomendadas
```env
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_UPLOAD_URL=http://localhost:4000/uploads
```

### Ejemplo de integración con React
```javascript
// Configuración de API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Función para hacer requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return response.json();
};

// Ejemplo de uso
const products = await apiRequest('/products');
const cart = await apiRequest('/cart');
```

## 🎯 Próximos Pasos

1. **Integración con frontend** (React, Vue, Angular)
2. **Implementar tests** unitarios e integración
3. **Agregar documentación Swagger**
4. **Configurar CI/CD**
5. **Implementar caché** (Redis)
6. **Agregar logs** estructurados
7. **Implementar rate limiting**
8. **Configurar monitoreo** (APM)

## 📞 Soporte

Para dudas o problemas, revisar:
1. Logs del servidor
2. Documentación de Prisma
3. Documentación de Express
4. Variables de entorno configuradas correctamente

