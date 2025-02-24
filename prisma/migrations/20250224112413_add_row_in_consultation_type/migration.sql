/*
  Warnings:

  - Added the required column `type_consultation` to the `Consultation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "type_consultation" TEXT NOT NULL;
