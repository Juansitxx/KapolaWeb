// Middleware de validación de datos
export const validateProduct = (req, res, next) => {
  const { name, price, stock } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push("El nombre del producto es obligatorio");
  }

  if (!price || isNaN(price) || parseFloat(price) <= 0) {
    errors.push("El precio debe ser un número mayor a 0");
  }

  if (stock !== undefined && (isNaN(stock) || parseInt(stock) < 0)) {
    errors.push("El stock debe ser un número mayor o igual a 0");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Errores de validación",
      errors
    });
  }

  next();
};

export const validateOrder = (req, res, next) => {
  const { items } = req.body;
  const errors = [];

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push("La orden debe contener al menos un producto");
  } else {
    items.forEach((item, index) => {
      if (!item.productId || !item.quantity) {
        errors.push(`Item ${index + 1}: productId y quantity son obligatorios`);
      }
      
      if (item.quantity && (isNaN(item.quantity) || parseInt(item.quantity) <= 0)) {
        errors.push(`Item ${index + 1}: quantity debe ser un número mayor a 0`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Errores de validación",
      errors
    });
  }

  next();
};

export const validateOrderStatus = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['pendiente', 'confirmada', 'en_proceso', 'enviada', 'entregada', 'cancelada'];

  if (!status) {
    return res.status(400).json({
      message: "El estado es obligatorio"
    });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Estado inválido",
      validStatuses
    });
  }

  next();
};

export const validateUser = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push("El nombre es obligatorio");
  }

  if (!email || email.trim().length === 0) {
    errors.push("El email es obligatorio");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Formato de email inválido");
    }
  }

  if (!password || password.length < 6) {
    errors.push("La contraseña debe tener al menos 6 caracteres");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Errores de validación",
      errors
    });
  }

  next();
};

