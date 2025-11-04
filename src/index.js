import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Rutas
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

// Middlewares
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";

console.log("Iniciando servidor...");

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
const uploadsStaticPath = path.resolve(__dirname, '../uploads');
console.log('📁 Serviendo archivos estáticos desde:', uploadsStaticPath);
app.use('/uploads', express.static(uploadsStaticPath));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de la API
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/upload", uploadRoutes);

// Ruta de salud del servidor
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0"
  });
});

// Ruta de información de la API
app.get("/api/info", (req, res) => {
  res.json({
    name: "Galletas App API",
    version: "1.0.0",
    description: "API REST para tienda de galletas",
    endpoints: {
      users: "/api/users",
      products: "/api/products",
      orders: "/api/orders",
      admin: "/api/admin",
      search: "/api/search",
      cart: "/api/cart",
      upload: "/api/upload"
    }
  });
});

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Puerto del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Info: http://localhost:${PORT}/api/info`);
  console.log(`📁 Archivos estáticos: http://localhost:${PORT}/uploads`);
});
