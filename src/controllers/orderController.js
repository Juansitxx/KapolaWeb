import { prisma } from "../config/prisma.js";

// Obtener todas las órdenes del usuario autenticado
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true
                }
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

// Obtener orden específica del usuario
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: { 
        id: parseInt(id),
        userId 
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener orden" });
  }
};

// Crear nueva orden
export const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: "La orden debe contener al menos un producto" 
      });
    }

    // Verificar que todos los productos existen y tienen stock
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        active: true 
      }
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({ 
        message: "Uno o más productos no están disponibles" 
      });
    }

    // Verificar stock y calcular totales
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Stock insuficiente para el producto: ${product.name}` 
        });
      }

      const subtotal = product.price * item.quantity;
      total += subtotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        subtotal
      });
    }

    // Crear la orden y sus items en una transacción
    const order = await prisma.$transaction(async (tx) => {
      // Crear la orden
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          paymentMethod,
          status: 'pendiente'
        }
      });

      // Crear los items de la orden
      const createdItems = await Promise.all(
        orderItems.map(item => 
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              ...item
            }
          })
        )
      );

      // Actualizar el stock de los productos
      await Promise.all(
        items.map(item => 
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        )
      );

      return {
        ...newOrder,
        items: createdItems
      };
    });

    res.status(201).json({
      message: "Orden creada exitosamente",
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear orden" });
  }
};

// Actualizar estado de la orden (solo para admin o el mismo usuario)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const validStatuses = ['pendiente', 'confirmada', 'en_proceso', 'enviada', 'entregada', 'cancelada'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Estado de orden inválido" 
      });
    }

    // Verificar que la orden existe y pertenece al usuario (o es admin)
    const order = await prisma.order.findFirst({
      where: { 
        id: parseInt(id),
        ...(userRole !== 'admin' ? { userId } : {})
      }
    });

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: "Estado de orden actualizado exitosamente",
      order: updatedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar orden" });
  }
};

// Cancelar orden
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: { 
        id: parseInt(id),
        userId 
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (order.status === 'cancelada') {
      return res.status(400).json({ message: "La orden ya está cancelada" });
    }

    if (['enviada', 'entregada'].includes(order.status)) {
      return res.status(400).json({ 
        message: "No se puede cancelar una orden que ya fue enviada o entregada" 
      });
    }

    // Cancelar orden y restaurar stock
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Actualizar estado de la orden
      const cancelledOrder = await tx.order.update({
        where: { id: parseInt(id) },
        data: { status: 'cancelada' }
      });

      // Restaurar stock de productos
      await Promise.all(
        order.items.map(item => 
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          })
        )
      );

      return cancelledOrder;
    });

    res.json({
      message: "Orden cancelada exitosamente",
      order: updatedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cancelar orden" });
  }
};

// Obtener estadísticas de órdenes (solo para admin)
export const getOrderStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    if (userRole !== 'admin') {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      ordersByStatus
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pendiente' } }),
      prisma.order.count({ where: { status: 'entregada' } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'entregada' }
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      ordersByStatus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};

