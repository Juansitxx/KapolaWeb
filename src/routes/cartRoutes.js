import express from "express";
import { 
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { clienteMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);
router.use(clienteMiddleware);

// Rutas del carrito
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeFromCart);
router.delete("/clear", clearCart);

export default router;

