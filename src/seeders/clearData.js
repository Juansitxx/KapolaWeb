import { PrismaClient } from "@prisma/client";
import readline from "readline";

const prisma = new PrismaClient();

// Crea una interfaz para leer desde la consola
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function clearDatabase() {
  rl.question("⚠️ ¿Seguro que quieres eliminar TODOS los datos de la base de datos? (escribe 'si' para continuar): ", async (answer) => {
    if (answer.toLowerCase() === "si" || answer.toLowerCase() === "sí") {
      try {
        console.log("\n🧹 Eliminando todos los datos...");

        // Orden correcto para evitar conflictos de FK
        await prisma.cartItem.deleteMany();
        await prisma.cart.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.product.deleteMany();
        await prisma.user.deleteMany();

        console.log("✅ Todos los datos han sido eliminados correctamente.");
      } catch (error) {
        console.error("❌ Error al limpiar la base de datos:", error);
      } finally {
        await prisma.$disconnect();
        rl.close();
      }
    } else {
      console.log("\n🛑 Operación cancelada. No se eliminó nada.");
      rl.close();
      await prisma.$disconnect();
    }
  });
}

clearDatabase();
