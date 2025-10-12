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
import { validateOrder, validateOrderStatus } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de órdenes
router.get("/", getUserOrders);
router.get("/stats", getOrderStats);
router.get("/:id", getOrderById);
router.post("/", validateOrder, createOrder);
router.put("/:id/status", validateOrderStatus, updateOrderStatus);
router.put("/:id/cancel", cancelOrder);

export default router;
