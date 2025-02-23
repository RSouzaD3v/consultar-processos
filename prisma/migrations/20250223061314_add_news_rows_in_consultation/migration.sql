-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "birthdate" TEXT NOT NULL DEFAULT 'none_birthdate',
ADD COLUMN     "reference_name" TEXT NOT NULL DEFAULT 'none_name',
ADD COLUMN     "tax_id_country" TEXT NOT NULL DEFAULT 'none_country',
ADD COLUMN     "tax_id_number" TEXT NOT NULL DEFAULT 'none_number',
ADD COLUMN     "tax_id_status" TEXT NOT NULL DEFAULT 'none_status';
