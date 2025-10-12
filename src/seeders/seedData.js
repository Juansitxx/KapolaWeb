import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const categories = [
  "Chocolate",
  "Vainilla",
  "Avena",
  "Mantequilla",
  "Frutas",
  "Especiales"
];

const sampleProducts = [
  {
    name: "Galletas de Chocolate Clásicas",
    description: "Deliciosas galletas de chocolate con chips de chocolate negro",
    price: 12.99,
    stock: 50,
    category: "Chocolate",
    imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400"
  },
  {
    name: "Galletas de Vainilla con Glaseado",
    description: "Suaves galletas de vainilla con glaseado de azúcar",
    price: 10.99,
    stock: 30,
    category: "Vainilla",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400"
  },
  {
    name: "Galletas de Avena y Pasas",
    description: "Saludables galletas de avena con pasas y canela",
    price: 11.50,
    stock: 25,
    category: "Avena",
    imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400"
  },
  {
    name: "Galletas de Mantequilla Artesanales",
    description: "Crujientes galletas de mantequilla hechas a mano",
    price: 9.99,
    stock: 40,
    category: "Mantequilla",
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400"
  },
  {
    name: "Galletas de Frutas Mixtas",
    description: "Coloridas galletas con trozos de frutas secas",
    price: 13.99,
    stock: 20,
    category: "Frutas",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-784f0b9d0e5b?w=400"
  },
  {
    name: "Galletas Especiales de Temporada",
    description: "Galletas decoradas para ocasiones especiales",
    price: 15.99,
    stock: 15,
    category: "Especiales",
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400"
  },
  {
    name: "Galletas de Chocolate Blanco",
    description: "Ricas galletas con chips de chocolate blanco",
    price: 12.50,
    stock: 35,
    category: "Chocolate",
    imageUrl: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400"
  },
  {
    name: "Galletas de Limón",
    description: "Refrescantes galletas con sabor a limón natural",
    price: 10.50,
    stock: 28,
    category: "Vainilla",
    imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400"
  }
];

const sampleUsers = [
  {
    name: "Admin Usuario",
    email: "admin@galletas.com",
    password: "admin123",
    role: "admin"
  },
  {
    name: "Juan Pérez",
    email: "juan@ejemplo.com",
    password: "cliente123",
    role: "cliente"
  },
  {
    name: "María García",
    email: "maria@ejemplo.com",
    password: "cliente123",
    role: "cliente"
  },
  {
    name: "Carlos López",
    email: "carlos@ejemplo.com",
    password: "cliente123",
    role: "cliente"
  }
];

export async function seedDatabase() {
  try {
    console.log("🌱 Iniciando seed de la base de datos...");

    // Limpiar datos existentes
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    console.log("🧹 Datos existentes eliminados");

    // Crear usuarios
    console.log("👥 Creando usuarios...");
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role
        }
      });
      createdUsers.push(user);
    }

    console.log(`✅ ${createdUsers.length} usuarios creados`);

    // Crear productos
    console.log("🍪 Creando productos...");
    const createdProducts = [];
    
    for (const productData of sampleProducts) {
      const product = await prisma.product.create({
        data: productData
      });
      createdProducts.push(product);
    }

    console.log(`✅ ${createdProducts.length} productos creados`);

    // Crear algunas órdenes de ejemplo
    console.log("📦 Creando órdenes de ejemplo...");
    const orders = [];
    
    // Orden 1 - Juan Pérez
    const order1 = await prisma.order.create({
      data: {
        userId: createdUsers[1].id, // Juan
        total: 25.98,
        status: "entregada",
        paymentMethod: "tarjeta"
      }
    });

    await prisma.orderItem.createMany({
      data: [
        {
          orderId: order1.id,
          productId: createdProducts[0].id,
          quantity: 2,
          subtotal: 25.98
        }
      ]
    });

    // Orden 2 - María García
    const order2 = await prisma.order.create({
      data: {
        userId: createdUsers[2].id, // María
        total: 32.97,
        status: "enviada",
        paymentMethod: "efectivo"
      }
    });

    await prisma.orderItem.createMany({
      data: [
        {
          orderId: order2.id,
          productId: createdProducts[1].id,
          quantity: 1,
          subtotal: 10.99
        },
        {
          orderId: order2.id,
          productId: createdProducts[2].id,
          quantity: 2,
          subtotal: 21.98
        }
      ]
    });

    // Orden 3 - Carlos López
    const order3 = await prisma.order.create({
      data: {
        userId: createdUsers[3].id, // Carlos
        total: 9.99,
        status: "pendiente",
        paymentMethod: "tarjeta"
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order3.id,
        productId: createdProducts[3].id,
        quantity: 1,
        subtotal: 9.99
      }
    });

    console.log("✅ 3 órdenes de ejemplo creadas");

    // Crear carritos de ejemplo
    console.log("🛒 Creando carritos de ejemplo...");
    
    const cart1 = await prisma.cart.create({
      data: { userId: createdUsers[1].id }
    });

    await prisma.cartItem.createMany({
      data: [
        {
          cartId: cart1.id,
          productId: createdProducts[4].id,
          quantity: 2
        },
        {
          cartId: cart1.id,
          productId: createdProducts[5].id,
          quantity: 1
        }
      ]
    });

    console.log("✅ Carritos de ejemplo creados");

    console.log("🎉 Seed completado exitosamente!");
    console.log("\n📊 Resumen:");
    console.log(`- ${createdUsers.length} usuarios`);
    console.log(`- ${createdProducts.length} productos`);
    console.log(`- 3 órdenes`);
    console.log(`- 1 carrito con items`);
    console.log("\n🔑 Credenciales de prueba:");
    console.log("Admin: admin@galletas.com / admin123");
    console.log("Cliente: juan@ejemplo.com / cliente123");

  } catch (error) {
    console.error("❌ Error durante el seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}


seedDatabase()
  .then(() => {
    console.log("✅ Seed ejecutado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  });

