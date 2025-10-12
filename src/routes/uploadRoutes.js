import express from "express";
import { 
  uploadProductImage,
  deleteProductImage,
  getProductImage
} from "../controllers/uploadController.js";
import { upload, handleUploadError } from "../services/fileUploadService.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de subida de archivos
router.post("/products/:productId/image", upload.single('image'), handleUploadError, uploadProductImage);
router.delete("/products/:productId/image", deleteProductImage);
router.get("/products/:productId/image", getProductImage);

export default router;

