import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function seedDatabase() {
  try {
    console.log("🌱 Iniciando seed de la base de datos (solo usuario admin)...");

    // Limpiar tablas
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    console.log("🧹 Datos existentes eliminados");

    // Crear usuario admin
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = await prisma.user.create({
      data: {
        name: "Admin Usuario",
        email: "admin@galletas.com",
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("✅ Usuario admin creado correctamente:");
    console.log(`- Email: ${adminUser.email}`);
    console.log(`- Contraseña: admin123`);

    console.log("🎉 Seed completado exitosamente ✅");
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
