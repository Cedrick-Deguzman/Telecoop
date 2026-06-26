-- Photo Documentation Module: generalize "installationphoto" into a polymorphic "photo" table.
-- In-place transform — preserves existing installation photo rows (no drop/recreate).

-- Rename the table
ALTER TABLE "installationphoto" RENAME TO "photo";

-- Align constraint / index names with the new table name
ALTER TABLE "photo" RENAME CONSTRAINT "installationphoto_pkey" TO "photo_pkey";
ALTER TABLE "photo" RENAME CONSTRAINT "installationphoto_installationId_fkey" TO "photo_installationId_fkey";
ALTER INDEX "installationphoto_installationId_idx" RENAME TO "photo_installationId_idx";

-- installationId becomes optional (inventory photos have no installation)
ALTER TABLE "photo" ALTER COLUMN "installationId" DROP NOT NULL;

-- Add the inventory link
ALTER TABLE "photo" ADD COLUMN "inventoryItemId" INTEGER;

ALTER TABLE "photo"
  ADD CONSTRAINT "photo_inventoryItemId_fkey"
    FOREIGN KEY ("inventoryItemId") REFERENCES "inventoryitem"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "photo_inventoryItemId_idx" ON "photo"("inventoryItemId");
