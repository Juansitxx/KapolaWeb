import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "./seedData.js";

const prisma = new PrismaClient();

async function resetDevelopmentDatabase() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Reset destructivo bloqueado: NODE_ENV=production");
  }

  try {
    console.log("Reset de desarrollo iniciado. Se eliminaran datos existentes.");

    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    console.log("Datos eliminados. Ejecutando seed de desarrollo...");

    await seedDatabase({ prismaClient: prisma, disconnect: false });

    console.log("Reset de desarrollo completado.");
  } catch (error) {
    console.error("Error durante el reset de desarrollo:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDevelopmentDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
