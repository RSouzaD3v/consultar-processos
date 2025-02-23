/*
  Warnings:

  - You are about to drop the `Consultation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Consultation" DROP CONSTRAINT "Consultation_userId_fkey";

-- DropTable
DROP TABLE "Consultation";
