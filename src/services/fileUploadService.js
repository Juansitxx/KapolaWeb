import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta absoluta para uploads 
// __dirname aquí es: src/services/
// Queremos: raiz/uploads/products
// Desde src/services/ necesitamos subir 2 niveles: ../../uploads/products
const uploadsDir = path.resolve(__dirname, '../../uploads/products');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Crear directorio si no existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${extension}`);
  }
});

// Filtro para tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Configuración de multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
  fileFilter: fileFilter
});

// Middleware para manejar errores de multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 5MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Demasiados archivos. Máximo 1 archivo por vez.' });
    }
  }
  
  if (error.message.includes('Solo se permiten archivos de imagen')) {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
};

// Función para eliminar archivo
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return false;
  }
};

// Función para obtener URL del archivo
export const getFileUrl = (req, filename) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/products/${filename}`;
};

// Función para validar y procesar imagen
export const processImage = async (filePath) => {
  try {
    // Aquí podrías agregar procesamiento de imagen como redimensionar, comprimir, etc.
    // Por ahora solo retornamos la información del archivo
    const stats = fs.statSync(filePath);
    
    return {
      success: true,
      size: stats.size,
      path: filePath
    };
  } catch (error) {
    console.error('Error al procesar imagen:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

