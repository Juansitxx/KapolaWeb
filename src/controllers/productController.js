import { prisma } from "../config/prisma.js";

// Obtener todos los productos
export const getAllProducts = async (req, res) => {
  try {
    const { category, active, page = 1, limit = 10 } = req.query;
    
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (active !== undefined) {
      where.active = active === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

// Obtener producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener producto" });
  }
};

// Crear nuevo producto
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, category } = req.body;

    // Validaciones
    if (!name || !price) {
      return res.status(400).json({ 
        message: "Nombre y precio son obligatorios" 
      });
    }

    if (price <= 0) {
      return res.status(400).json({ 
        message: "El precio debe ser mayor a 0" 
      });
    }

    if (stock < 0) {
      return res.status(400).json({ 
        message: "El stock no puede ser negativo" 
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        imageUrl,
        category
      }
    });

    res.status(201).json({
      message: "Producto creado exitosamente",
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear producto" });
  }
};

// Actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, imageUrl, category, active } = req.body;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Validaciones
    if (price !== undefined && price <= 0) {
      return res.status(400).json({ 
        message: "El precio debe ser mayor a 0" 
      });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ 
        message: "El stock no puede ser negativo" 
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (category !== undefined) updateData.category = category;
    if (active !== undefined) updateData.active = active === 'true' || active === true;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({
      message: "Producto actualizado exitosamente",
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar producto" });
  }
};

// Eliminar producto (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Soft delete - marcar como inactivo
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { active: false }
    });

    res.json({
      message: "Producto eliminado exitosamente",
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};

// Obtener categorías disponibles
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      where: { 
        category: { not: null },
        active: true 
      },
      distinct: ['category']
    });

    const categoryList = categories.map(item => item.category).filter(Boolean);
    
    res.json({ categories: categoryList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
};

