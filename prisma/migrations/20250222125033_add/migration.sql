/*
  Warnings:

  - Added the required column `custom_name` to the `Consultation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "custom_name" TEXT NOT NULL;
