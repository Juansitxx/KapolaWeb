import express from "express";
import { 
  getUserOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus, 
  cancelOrder,
  getOrderStats 
} from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware, clienteMiddleware } from "../middleware/roleMiddleware.js";
import { validateOrder, validateOrderStatus } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de órdenes
router.get("/", clienteMiddleware, getUserOrders);
router.get("/stats", adminMiddleware, getOrderStats);
router.get("/:id", clienteMiddleware, getOrderById);
router.post("/", clienteMiddleware, validateOrder, createOrder);
router.put("/:id/status", adminMiddleware, validateOrderStatus, updateOrderStatus);
router.put("/:id/cancel", clienteMiddleware, cancelOrder);

export default router;
