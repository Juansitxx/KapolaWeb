import express from "express";
import { 
  getAllUsers,
  getDashboardStats,
  updateUserRole,
  getAllOrders,
  updateOrderStatusAdmin,
  deleteUser,
  adminMiddleware
} from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación y ser admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard y estadísticas
router.get("/dashboard", getDashboardStats);

// Gestión de usuarios
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Gestión de órdenes
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatusAdmin);

export default router;

