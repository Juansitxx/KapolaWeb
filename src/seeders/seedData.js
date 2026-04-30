import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const testUsers = [
  {
    name: "Admin Kapola",
    email: "admin@galletas.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Cliente Kapola",
    email: "cliente@galletas.com",
    password: "cliente123",
    role: "cliente",
  },
];

const demoProducts = [
  {
    name: "New York Chocolate Chunk",
    description: "Galleta estilo New York, gruesa, suave al centro y cargada de trozos de chocolate.",
    price: 6500,
    stock: 24,
    imageUrl: "http://localhost:4000/uploads/products/product-1762217126337-696499166.jpg",
    category: "New York",
  },
  {
    name: "New York Red Velvet",
    description: "Galleta red velvet con relleno cremoso tipo cheesecake.",
    price: 7000,
    stock: 18,
    imageUrl: "http://localhost:4000/uploads/products/product-1762217102331-963739433.jpg",
    category: "Red Velvet",
  },
  {
    name: "Triple Chocolate",
    description: "Masa de cacao con chips de chocolate oscuro, chocolate de leche y chocolate blanco.",
    price: 6800,
    stock: 20,
    imageUrl: "http://localhost:4000/uploads/products/product-1762217102074-240558468.jpg",
    category: "Chocolate",
  },
  {
    name: "Clasica Vainilla Chips",
    description: "Galleta clasica de vainilla con chips de chocolate semiamargo.",
    price: 5200,
    stock: 30,
    imageUrl: "http://localhost:4000/uploads/products/product-1762216328375-89533249.jpg",
    category: "Clasicas",
  },
  {
    name: "Avena y Chocolate",
    description: "Galleta de avena con notas de canela y chips de chocolate.",
    price: 5400,
    stock: 16,
    imageUrl: "http://localhost:4000/uploads/products/product-1763171193325-407247662.jpg",
    category: "Clasicas",
  },
  {
    name: "Brownie Cookie",
    description: "Galleta intensa de chocolate con textura de brownie y centro suave.",
    price: 7200,
    stock: 14,
    imageUrl: "http://localhost:4000/uploads/products/product-1762217126337-696499166.jpg",
    category: "Chocolate",
  },
  {
    name: "Red Velvet White Chips",
    description: "Red velvet con chips de chocolate blanco y toque de vainilla.",
    price: 6900,
    stock: 22,
    imageUrl: "http://localhost:4000/uploads/products/product-1762217102331-963739433.jpg",
    category: "Red Velvet",
  },
  {
    name: "Pistacho Especial",
    description: "Galleta especial con pistacho tostado y chocolate blanco.",
    price: 7800,
    stock: 12,
    imageUrl: "http://localhost:4000/uploads/products/product-1762217102074-240558468.jpg",
    category: "Especiales",
  },
  {
    name: "Cookies and Cream",
    description: "Galleta con trozos de galleta de crema y chocolate blanco.",
    price: 6900,
    stock: 19,
    imageUrl: "http://localhost:4000/uploads/products/product-1762216328375-89533249.jpg",
    category: "Especiales",
  },
  {
    name: "New York Nutella",
    description: "Galleta estilo New York con relleno de avellana y cacao.",
    price: 7600,
    stock: 15,
    imageUrl: "http://localhost:4000/uploads/products/product-1763171193325-407247662.jpg",
    category: "New York",
  },
];

function assertDevelopmentEnvironment() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed de desarrollo bloqueado: NODE_ENV=production");
  }
}

async function upsertUser({ name, email, password, role }, prismaClient) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const existingUser = await prismaClient.user.findUnique({ where: { email } });

  if (existingUser) {
    return prismaClient.user.update({
      where: { email },
      data: { name, password: hashedPassword, role },
    });
  }

  return prismaClient.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });
}

async function upsertProductByName(productData, prismaClient) {
  const existingProduct = await prismaClient.product.findFirst({
    where: { name: productData.name },
  });

  if (existingProduct) {
    return prismaClient.product.update({
      where: { id: existingProduct.id },
      data: {
        ...productData,
        active: true,
      },
    });
  }

  return prismaClient.product.create({
    data: {
      ...productData,
      active: true,
    },
  });
}

export async function seedDatabase({ prismaClient = prisma, disconnect = true } = {}) {
  assertDevelopmentEnvironment();

  try {
    console.log("Iniciando seed de desarrollo de Kapola...");

    for (const user of testUsers) {
      const savedUser = await upsertUser(user, prismaClient);
      console.log(`Usuario listo: ${savedUser.email} (${savedUser.role})`);
    }

    for (const product of demoProducts) {
      const savedProduct = await upsertProductByName(product, prismaClient);
      console.log(`Producto listo: ${savedProduct.name} [${savedProduct.category}]`);
    }

    console.log("Seed de desarrollo completado.");
    console.log("Credenciales de prueba:");
    console.log("- Admin: admin@galletas.com / admin123");
    console.log("- Cliente: cliente@galletas.com / cliente123");
  } catch (error) {
    console.error("Error durante el seed:", error);
    throw error;
  } finally {
    if (disconnect) {
      await prismaClient.$disconnect();
    }
  }
}

const isExecutedDirectly = process.argv[1]
  ? fileURLToPath(import.meta.url) === process.argv[1]
  : false;

if (isExecutedDirectly) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
