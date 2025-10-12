// Configuración para integración con frontend

export const frontendConfig = {
  // URLs base de la API
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000/api',
  
  // Configuración de CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  },
  
  // Configuración de archivos
  uploads: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    uploadPath: 'uploads/products'
  },
  
  // Configuración de paginación
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },
  
  // Configuración de JWT
  jwt: {
    expiresIn: '2h',
    refreshExpiresIn: '7d'
  },
  
  // Configuración de validación
  validation: {
    password: {
      minLength: 6,
      requireSpecialChar: false,
      requireNumber: false,
      requireUppercase: false
    },
    product: {
      nameMaxLength: 100,
      descriptionMaxLength: 500,
      priceMin: 0.01,
      priceMax: 9999.99,
      stockMin: 0,
      stockMax: 9999
    }
  },
  
  // Estados de orden
  orderStatuses: [
    'pendiente',
    'confirmada', 
    'en_proceso',
    'enviada',
    'entregada',
    'cancelada'
  ],
  
  // Roles de usuario
  userRoles: [
    'cliente',
    'admin'
  ],
  
  // Categorías de productos
  productCategories: [
    'Chocolate',
    'Vainilla',
    'Avena',
    'Mantequilla',
    'Frutas',
    'Especiales'
  ],
  
  // Configuración de email
  email: {
    from: process.env.EMAIL_FROM || 'noreply@galletasapp.com',
    templates: {
      welcome: 'welcome',
      orderConfirmation: 'order_confirmation',
      orderStatusUpdate: 'order_status_update',
      orderShipped: 'order_shipped'
    }
  },
  
  // Configuración de notificaciones
  notifications: {
    email: {
      enabled: process.env.EMAIL_ENABLED === 'true',
      sendWelcomeEmail: true,
      sendOrderConfirmation: true,
      sendStatusUpdates: true
    }
  }
};

// Función para obtener configuración específica
export const getConfig = (key) => {
  const keys = key.split('.');
  let value = frontendConfig;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  return value;
};

// Función para validar configuración
export const validateConfig = () => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Variables de entorno faltantes: ${missing.join(', ')}`);
  }
  
  return true;
};

