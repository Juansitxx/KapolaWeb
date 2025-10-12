import express from "express";
import { 
  searchProducts,
  getPopularProducts,
  getRelatedProducts,
  getSearchSuggestions
} from "../controllers/searchController.js";

const router = express.Router();

// Rutas de búsqueda (públicas)
router.get("/products", searchProducts);
router.get("/products/popular", getPopularProducts);
router.get("/products/:id/related", getRelatedProducts);
router.get("/suggestions", getSearchSuggestions);

export default router;

