-- AlterTable
ALTER TABLE "RetailLocation"
  ADD COLUMN "theme" JSONB NOT NULL DEFAULT jsonb_build_object('primary', '#798aa8', 'secondary', '#76e1a7', 'accent', '#c2664d');
