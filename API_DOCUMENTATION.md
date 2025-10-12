# API de Galletas App - Documentación

## Descripción
API REST para una aplicación de e-commerce de galletas construida con Node.js, Express y Prisma.

## Tecnologías
- Node.js + Express.js
- PostgreSQL + Prisma ORM
- JWT para autenticación
- bcrypt para encriptación de contraseñas

## Configuración

### Variables de Entorno
Crear un archivo `.env` con las siguientes variables:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/galletas_db"
JWT_SECRET="tu_jwt_secret_muy_seguro_aqui"
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Instalación
```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

## Endpoints de la API

### Autenticación

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

### Productos

#### GET /api/products
Obtener todos los productos
- Query params: `category`, `active`, `page`, `limit`

#### GET /api/products/categories
Obtener categorías disponibles

#### GET /api/products/:id
Obtener producto por ID

#### POST /api/products
Crear producto (requiere autenticación)
```json
{
  "name": "Galletas de Chocolate",
  "description": "Deliciosas galletas de chocolate",
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

### Órdenes

#### GET /api/orders
Obtener órdenes del usuario (requiere autenticación)
- Query params: `page`, `limit`, `status`

#### GET /api/orders/stats
Obtener estadísticas (solo admin)

#### GET /api/orders/:id
Obtener orden específica (requiere autenticación)

#### POST /api/orders
Crear nueva orden (requiere autenticación)
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
Actualizar estado de orden (requiere autenticación)
```json
{
  "status": "confirmada"
}
```

#### PUT /api/orders/:id/cancel
Cancelar orden (requiere autenticación)

### Health Check

#### GET /api/health
Verificar estado del servidor

## Estados de Orden
- `pendiente`: Orden creada, esperando confirmación
- `confirmada`: Orden confirmada por el usuario
- `en_proceso`: Orden siendo preparada
- `enviada`: Orden enviada
- `entregada`: Orden entregada
- `cancelada`: Orden cancelada

## Autenticación
Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

## Respuestas de Error
```json
{
  "message": "Descripción del error",
  "errors": ["Lista de errores específicos"]
}
```

## Códigos de Estado HTTP
- 200: Éxito
- 201: Creado exitosamente
- 400: Error de validación
- 401: No autorizado
- 403: Acceso denegado
- 404: No encontrado
- 500: Error interno del servidor

