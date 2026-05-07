import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    name: "Admin Kapola",
    email: "admin@galletas.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Cliente Demo",
    email: "cliente@galletas.com",
    password: "cliente123",
    role: "cliente",
  },
];

const DEMO_PRODUCTS = [
  {
    name: "Galleta New York Chocolate",
    description: "Galleta gruesa estilo New York con masa suave y chunks de chocolate semiamargo.",
    price: 8500,
    stock: 24,
    imageUrl: "/uploads/products/product-1762217126337-696499166.jpg",
    category: "New York",
  },
  {
    name: "Galleta Red Velvet",
    description: "Galleta red velvet con notas de cacao, vainilla y chips de chocolate blanco.",
    price: 8200,
    stock: 18,
    imageUrl: "/uploads/products/product-1762217102331-963739433.jpg",
    category: "Red Velvet",
  },
  {
    name: "Galleta Choco Chips",
    description: "Clasica galleta dorada con chips de chocolate y centro suave.",
    price: 6500,
    stock: 32,
    imageUrl: "/uploads/products/product-1762216328375-89533249.jpg",
    category: "Clasicas",
  },
  {
    name: "Galleta Nutella",
    description: "Galleta rellena de crema de avellana y cacao, horneada al estilo Kapola.",
    price: 9000,
    stock: 16,
    imageUrl: "/uploads/products/product-1763171193325-407247662.jpg",
    category: "Especiales",
  },
  {
    name: "Galleta Brownie",
    description: "Galleta intensa de chocolate con textura de brownie y topping de chips.",
    price: 8800,
    stock: 20,
    imageUrl: "/uploads/products/product-1762217102074-240558468.jpg",
    category: "Chocolate",
  },
  {
    name: "Galleta Oreo",
    description: "Galleta de vainilla con trozos de Oreo y chocolate blanco.",
    price: 7800,
    stock: 22,
    imageUrl: "/uploads/products/product-1762216328375-89533249.jpg",
    category: "Especiales",
  },
  {
    name: "Caja x4 Galletas",
    description: "Caja para regalar o compartir con cuatro galletas surtidas de Kapola.",
    price: 30000,
    stock: 12,
    imageUrl: "/uploads/products/product-1762217126337-696499166.jpg",
    category: "Cajas",
  },
  {
    name: "Caja x6 Galletas",
    description: "Caja grande con seis galletas surtidas, ideal para reuniones y antojos.",
    price: 43000,
    stock: 10,
    imageUrl: "/uploads/products/product-1762217102331-963739433.jpg",
    category: "Cajas",
  },
  {
    name: "Combo Regalo",
    description: "Combo especial con galletas surtidas y empaque listo para regalo.",
    price: 52000,
    stock: 8,
    imageUrl: "/uploads/products/product-1763171193325-407247662.jpg",
    category: "Especiales",
  },
];

function assertSafeEnvironment() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed demo bloqueado: NODE_ENV=production");
  }
}

async function upsertDemoUser(user) {
  const hashedPassword = await bcrypt.hash(user.password, 10);

  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      password: hashedPassword,
      role: user.role,
    },
    create: {
      name: user.name,
      email: user.email,
      password: hashedPassword,
      role: user.role,
    },
  });
}

async function upsertDemoProduct(product) {
  const existingProduct = await prisma.product.findFirst({
    where: { name: product.name },
  });

  if (existingProduct) {
    return prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        ...product,
        active: true,
      },
    });
  }

  return prisma.product.create({
    data: {
      ...product,
      active: true,
    },
  });
}

async function seedDemo() {
  assertSafeEnvironment();

  console.log("Seed demo seguro iniciado. No se borraran datos existentes.");

  for (const user of DEMO_USERS) {
    const savedUser = await upsertDemoUser(user);
    console.log(`Usuario demo listo: ${savedUser.email} (${savedUser.role})`);
  }

  for (const product of DEMO_PRODUCTS) {
    const savedProduct = await upsertDemoProduct(product);
    console.log(`Producto demo listo: ${savedProduct.name} [${savedProduct.category}]`);
  }

  console.log("Seed demo completado.");
  console.log("Credenciales demo:");
  console.log("- Admin: admin@galletas.com / admin123");
  console.log("- Cliente: cliente@galletas.com / cliente123");
}

seedDemo()
  .catch((error) => {
    console.error("Error durante el seed demo:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
