import { prisma } from "../config/prisma.js";

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

