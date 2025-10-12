// Middleware centralizado de manejo de errores
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({
      message: "Ya existe un registro con este valor único",
      field: err.meta?.target
    });
  }

  // Error de registro no encontrado en Prisma
  if (err.code === 'P2025') {
    return res.status(404).json({
      message: "Registro no encontrado"
    });
  }

  // Error de violación de clave foránea
  if (err.code === 'P2003') {
    return res.status(400).json({
      message: "Violación de clave foránea"
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: "Token inválido"
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: "Token expirado"
    });
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: "Error de validación",
      errors: err.errors
    });
  }

  // Error por defecto
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`
  });
};

