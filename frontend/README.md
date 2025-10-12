# Galletas App - Frontend

Frontend de la aplicación de e-commerce de galletas construido con React, TypeScript y Material-UI.

## 🚀 Características

- **React 18** con TypeScript
- **Material-UI** para componentes de interfaz
- **React Router** para navegación
- **Axios** para comunicación con la API
- **Context API** para manejo de estado
- **Responsive Design** para móviles y desktop

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

## 🌐 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_UPLOAD_URL=http://localhost:4000/uploads
```

## 🎯 Funcionalidades Implementadas

### ✅ Completadas
- **Autenticación**: Login y registro de usuarios
- **Productos**: Listado, búsqueda y filtros
- **Carrito**: Agregar, actualizar y eliminar productos
- **Navegación**: Header responsive con menú móvil
- **UI/UX**: Diseño moderno con Material-UI

### 🚧 En Desarrollo
- Página de carrito de compras
- Página de órdenes
- Panel de administración
- Detalles de producto
- Checkout y pagos

## 🛠️ Scripts Disponibles

```bash
npm start          # Iniciar servidor de desarrollo
npm run build      # Construir para producción
npm test           # Ejecutar tests
npm run eject      # Eyectar configuración (no recomendado)
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Header.tsx      # Barra de navegación
│   └── ProductCard.tsx # Tarjeta de producto
├── contexts/           # Contextos de React
│   ├── AuthContext.tsx # Contexto de autenticación
│   └── CartContext.tsx # Contexto del carrito
├── pages/              # Páginas de la aplicación
│   ├── Home.tsx        # Página principal
│   ├── Login.tsx       # Página de login
│   └── Register.tsx    # Página de registro
├── services/           # Servicios de API
│   └── api.ts          # Cliente de API
├── types/              # Tipos TypeScript
│   └── index.ts        # Definiciones de tipos
├── App.tsx             # Componente principal
└── index.tsx           # Punto de entrada
```

## 🎨 Tema Personalizado

La aplicación usa un tema personalizado con colores de galletas:
- **Primario**: #8B4513 (Marrón chocolate)
- **Secundario**: #D2691E (Marrón claro)
- **Fondo**: #fafafa

## 🔗 Integración con Backend

El frontend se conecta con la API REST en `http://localhost:4000/api` y incluye:
- Autenticación JWT
- Manejo de errores
- Interceptores de Axios
- Contextos para estado global

## 🚀 Próximos Pasos

1. **Completar páginas faltantes**:
   - Carrito de compras
   - Detalles de producto
   - Historial de órdenes
   - Panel de administración

2. **Mejorar funcionalidades**:
   - Búsqueda avanzada
   - Filtros por precio
   - Paginación
   - Notificaciones

3. **Optimizaciones**:
   - Lazy loading
   - Caché de productos
   - PWA features
   - Tests unitarios

## 📱 Responsive Design

La aplicación está optimizada para:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

## 🔧 Desarrollo

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.