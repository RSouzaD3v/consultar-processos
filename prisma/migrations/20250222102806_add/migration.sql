-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "queryDate" TIMESTAMP(3) NOT NULL,
    "document" TEXT NOT NULL,
    "customer_Id" TEXT NOT NULL,
    "type_consultation" TEXT NOT NULL,
    "result" JSONB,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
