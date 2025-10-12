import express from "express";
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getCategories 
} from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateProduct } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Rutas públicas
router.get("/", getAllProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);

// Rutas protegidas (requieren autenticación)
router.post("/", authMiddleware, validateProduct, createProduct);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
