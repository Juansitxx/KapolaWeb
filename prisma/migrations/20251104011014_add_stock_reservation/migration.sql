/*
  Warnings:

  - You are about to drop the `StockReservation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."StockReservation" DROP CONSTRAINT "StockReservation_cartItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StockReservation" DROP CONSTRAINT "StockReservation_productId_fkey";

-- DropTable
DROP TABLE "public"."StockReservation";
