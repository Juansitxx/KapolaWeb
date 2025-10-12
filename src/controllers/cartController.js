import { prisma } from "../config/prisma.js";

// Obtener carrito del usuario
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar carrito activo o crear uno nuevo
    let cart = await prisma.cart.findFirst({
      where: { 
        userId,
        status: 'active'
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
                stock: true,
                active: true
              }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                  stock: true,
                  active: true
                }
              }
            }
          }
        }
      });
    }

    // Calcular totales
    const total = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      cart: {
        ...cart,
        total,
        itemCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener carrito" });
  }
};

// Agregar producto al carrito
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!productId || quantity <= 0) {
      return res.status(400).json({ 
        message: "Producto ID y cantidad son requeridos" 
      });
    }

    // Verificar que el producto existe y está disponible
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product || !product.active) {
      return res.status(404).json({ message: "Producto no disponible" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: "Stock insuficiente" 
      });
    }

    // Buscar o crear carrito
    let cart = await prisma.cart.findFirst({
      where: { 
        userId,
        status: 'active'
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: parseInt(productId)
      }
    });

    if (existingItem) {
      // Actualizar cantidad
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          message: "Stock insuficiente para la cantidad solicitada" 
        });
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
    } else {
      // Agregar nuevo item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity
        }
      });
    }

    res.json({ message: "Producto agregado al carrito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al agregar producto al carrito" });
  }
};

// Actualizar cantidad en el carrito
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (quantity <= 0) {
      return res.status(400).json({ 
        message: "La cantidad debe ser mayor a 0" 
      });
    }

    // Verificar que el item pertenece al usuario
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(itemId),
        cart: { userId }
      },
      include: {
        product: true
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Item no encontrado en el carrito" });
    }

    if (cartItem.product.stock < quantity) {
      return res.status(400).json({ 
        message: "Stock insuficiente" 
      });
    }

    await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity }
    });

    res.json({ message: "Cantidad actualizada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar carrito" });
  }
};

// Eliminar item del carrito
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    // Verificar que el item pertenece al usuario
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(itemId),
        cart: { userId }
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Item no encontrado en el carrito" });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(itemId) }
    });

    res.json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar producto del carrito" });
  }
};

// Limpiar carrito
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findFirst({
      where: { 
        userId,
        status: 'active'
      }
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    res.json({ message: "Carrito limpiado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al limpiar carrito" });
  }
};

