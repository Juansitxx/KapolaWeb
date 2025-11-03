import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const categories = [
  "Chocolate",
  "Red Velvet",
  "Maracuyá",
  "Oreo",
  "Especiales"
];

const sampleProducts = [
  {
    name: "Galleta de chips de chocolate",
    description: "Deliciosas galletas de chocolate con chips de chocolate negro",
    price: 5500,
    stock: 50,
    category: "Chocolate",
    imageUrl: "https://imgur.com/a/s7gsdUw"
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

