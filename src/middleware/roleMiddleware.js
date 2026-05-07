export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Acceso no autorizado" });
    }

    if (!req.user.role) {
      return res.status(403).json({
        message: "Acceso denegado. El usuario no tiene un rol asignado.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Acceso denegado. No tienes permisos para realizar esta accion.",
      });
    }

    next();
  };
};

export const adminMiddleware = requireRole("admin");
export const clienteMiddleware = requireRole("cliente");
