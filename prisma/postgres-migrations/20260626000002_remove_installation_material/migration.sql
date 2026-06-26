-- Remove the legacy InstallationMaterial model. Superseded by InstallationMaterialUsage,
-- which links installations to real inventory items and deducts stock on completion.
-- No live data path wrote to this table after the material-usage flow was adopted.

DROP TABLE IF EXISTS "installationmaterial";
