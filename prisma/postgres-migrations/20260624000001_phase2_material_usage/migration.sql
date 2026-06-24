-- Phase 2: Material usage tracking per installation

CREATE TABLE "installationmaterial" (
    "id"             SERIAL NOT NULL,
    "installationId" INTEGER NOT NULL,
    "dropCable"      DOUBLE PRECISION,
    "scConnector"    INTEGER,
    "cableTies"      INTEGER,
    "clamps"         INTEGER,
    "patchCord"      INTEGER,
    "submittedAt"    TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "installationmaterial_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "installationmaterial_installationId_key"
    ON "installationmaterial"("installationId");

ALTER TABLE "installationmaterial"
    ADD CONSTRAINT "installationmaterial_installationId_fkey"
    FOREIGN KEY ("installationId") REFERENCES "installation"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
