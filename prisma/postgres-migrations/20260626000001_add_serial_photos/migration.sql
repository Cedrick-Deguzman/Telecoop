-- Photo Documentation Module: allow photos to attach to an individual serialized unit.
-- Additive — existing rows untouched.

ALTER TABLE "photo" ADD COLUMN "inventorySerialId" INTEGER;

ALTER TABLE "photo"
  ADD CONSTRAINT "photo_inventorySerialId_fkey"
    FOREIGN KEY ("inventorySerialId") REFERENCES "inventoryserial"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "photo_inventorySerialId_idx" ON "photo"("inventorySerialId");
