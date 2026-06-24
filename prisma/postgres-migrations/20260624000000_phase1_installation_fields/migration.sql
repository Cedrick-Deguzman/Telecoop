-- Phase 1: Installation module technical fields

-- Fiber information on installation
ALTER TABLE "installation" ADD COLUMN "napboxId" INTEGER;
ALTER TABLE "installation" ADD COLUMN "portNumber" INTEGER;
ALTER TABLE "installation" ADD COLUMN "fiberCore" TEXT;
ALTER TABLE "installation" ADD COLUMN "dropCableLength" DOUBLE PRECISION;

-- Device information on installation
ALTER TABLE "installation" ADD COLUMN "onuSerial" TEXT;
ALTER TABLE "installation" ADD COLUMN "routerSerial" TEXT;
ALTER TABLE "installation" ADD COLUMN "macAddress" TEXT;

-- Signal readings on installation
ALTER TABLE "installation" ADD COLUMN "rxReading" DOUBLE PRECISION;
ALTER TABLE "installation" ADD COLUMN "txReading" DOUBLE PRECISION;

-- GPS location on installation
ALTER TABLE "installation" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "installation" ADD COLUMN "longitude" DOUBLE PRECISION;

-- Foreign key: installation → napbox
ALTER TABLE "installation" ADD CONSTRAINT "installation_napboxId_fkey"
  FOREIGN KEY ("napboxId") REFERENCES "napbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Address and GPS on client (persisted after prospect conversion)
ALTER TABLE "client" ADD COLUMN "address" TEXT;
ALTER TABLE "client" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "client" ADD COLUMN "longitude" DOUBLE PRECISION;
