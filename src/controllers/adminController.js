import { prisma } from "../config/prisma.js";
import { validateProduct } from "../middleware/validationMiddleware.js";

// Middleware para verificar si es admin
export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
  }
  next();
};

// Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: { orders: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

// Obtener estadísticas generales
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      ordersByStatus,
      revenueByMonth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'entregada' }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          },
          items: {
            include: {
              product: {
                select: { name: true }
              }
            }
          }
        }
      }),
      prisma.product.findMany({
        where: {
          active: true,
          stock: { lte: 10 }
        },
        select: {
          id: true,
          name: true,
          stock: true,
          price: true
        }
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as orders_count,
          COALESCE(SUM("total"), 0) as revenue
        FROM "Order"
        WHERE "status" = 'entregada'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
        LIMIT 12
      `
    ]);

    res.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0
      },
      recentOrders,
      lowStockProducts,
      ordersByStatus,
      revenueByMonth
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};

// Actualizar rol de usuario
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['cliente', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: "Rol inválido",
        validRoles 
      });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json({
      message: "Rol de usuario actualizado exitosamente",
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar rol de usuario" });
  }
};

// Obtener todas las órdenes (admin)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId, startDate, endDate } = req.query;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = parseInt(userId);
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, price: true }
              }
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener órdenes" });
  }
};

// Actualizar estado de orden (admin)
export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pendiente', 'confirmada', 'en_proceso', 'enviada', 'entregada', 'cancelada'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Estado de orden inválido",
        validStatuses 
      });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { 
        status,
        ...(notes && { notes })
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true }
            }
          }
        }
      }
    });

    res.json({
      message: "Estado de orden actualizado exitosamente",
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar estado de orden" });
  }
};

// Eliminar usuario (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que no sea el mismo usuario
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ 
        message: "No puedes eliminar tu propia cuenta" 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { orders: true }
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si tiene órdenes, cancelarlas
    if (user.orders.length > 0) {
      await prisma.order.updateMany({
        where: { 
          userId: parseInt(id),
          status: { in: ['pendiente', 'confirmada', 'en_proceso'] }
        },
        data: { status: 'cancelada' }
      });
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: "Usuario eliminado exitosamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

// ============ GESTIÓN DE PRODUCTOS (ADMIN) ============

// Obtener todos los productos (admin - incluye inactivos)
export const getAllProductsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, active, search } = req.query;
    
    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (active !== undefined) {
      where.active = active === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
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

// Crear nuevo producto (admin)
export const createProductAdmin = async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl, category, active } = req.body;

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
        description: description || '',
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        imageUrl: imageUrl || null,
        category: category || null,
        active: active !== undefined ? (active === 'true' || active === true) : true
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

// Actualizar producto (admin)
export const updateProductAdmin = async (req, res) => {
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

// Eliminar producto (admin - hard delete)
export const deleteProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "ID de producto inválido" });
    }

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        cartItems: true,
        items: true // OrderItems
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Verificar si tiene órdenes asociadas (OrderItems)
    if (existingProduct.items && existingProduct.items.length > 0) {
      // Si tiene órdenes, solo hacer soft delete
      const product = await prisma.product.update({
        where: { id: productId },
        data: { active: false }
      });

      return res.json({
        message: "Producto desactivado (tiene órdenes asociadas)",
        product
      });
    }

    // Usar transacción para asegurar que todo se elimine correctamente
    await prisma.$transaction(async (tx) => {
      // Eliminar items de carrito primero
      if (existingProduct.cartItems && existingProduct.cartItems.length > 0) {
        await tx.cartItem.deleteMany({
          where: { productId: productId }
        });
      }

      // Eliminar producto
      await tx.product.delete({
        where: { id: productId }
      });
    });

    res.json({
      message: "Producto eliminado exitosamente"
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    // Error de foreign key constraint
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        message: "No se puede eliminar el producto porque tiene órdenes asociadas. Se desactivará en su lugar.",
        action: "soft_delete"
      });
    }
    
    res.status(500).json({ 
      message: "Error al eliminar producto",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: process.env.NODE_ENV === 'development' ? error.code : undefined
    });
  }
};

