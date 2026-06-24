-- Phase 4: Installation photo uploads
CREATE TABLE "installationphoto" (
  "id"             SERIAL PRIMARY KEY,
  "installationId" INTEGER NOT NULL,
  "url"            TEXT NOT NULL,
  "publicId"       TEXT NOT NULL,
  "category"       TEXT NOT NULL,
  "caption"        TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "installationphoto_installationId_fkey"
    FOREIGN KEY ("installationId") REFERENCES "installation"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "installationphoto_installationId_idx" ON "installationphoto"("installationId");
