-- AlterTable
ALTER TABLE "installation" ADD COLUMN     "convertedAt" TIMESTAMP(3),
ADD COLUMN     "prospectAddress" TEXT,
ADD COLUMN     "prospectName" TEXT,
ADD COLUMN     "prospectPhone" TEXT;
