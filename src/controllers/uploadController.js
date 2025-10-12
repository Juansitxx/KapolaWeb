import { upload, handleUploadError, getFileUrl, deleteFile } from "../services/fileUploadService.js";
import { prisma } from "../config/prisma.js";

// Subir imagen de producto
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ningún archivo" });
    }

    const { productId } = req.params;
    
    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      // Eliminar archivo si el producto no existe
      deleteFile(req.file.path);
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Eliminar imagen anterior si existe
    if (product.imageUrl) {
      const oldImagePath = product.imageUrl.split('/').pop();
      deleteFile(`uploads/products/${oldImagePath}`);
    }

    // Actualizar producto con nueva imagen
    const imageUrl = getFileUrl(req, req.file.filename);
    
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: { imageUrl },
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    });

    res.json({
      message: "Imagen subida exitosamente",
      product: updatedProduct,
      imageUrl
    });
  } catch (error) {
    console.error(error);
    
    // Eliminar archivo en caso de error
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    res.status(500).json({ message: "Error al subir imagen" });
  }
};

// Eliminar imagen de producto
export const deleteProductImage = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (!product.imageUrl) {
      return res.status(400).json({ message: "El producto no tiene imagen" });
    }

    // Eliminar archivo del sistema
    const filename = product.imageUrl.split('/').pop();
    const deleted = deleteFile(`uploads/products/${filename}`);

    // Actualizar producto
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: { imageUrl: null },
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    });

    res.json({
      message: "Imagen eliminada exitosamente",
      product: updatedProduct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar imagen" });
  }
};

// Obtener imagen de producto
export const getProductImage = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      select: { imageUrl: true }
    });

    if (!product || !product.imageUrl) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    res.json({ imageUrl: product.imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener imagen" });
  }
};

