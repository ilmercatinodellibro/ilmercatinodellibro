-- See https://stackoverflow.com/a/62793792
DO $$
  DECLARE book_meta_view_definition TEXT;
  DECLARE exec_text TEXT;
BEGIN
  book_meta_view_definition := pg_get_viewdef('"BookMeta"');
  DROP VIEW "BookMeta";

  -- AlterTable
  ALTER TABLE "BookCopy" ALTER COLUMN "returned_at" SET DATA TYPE TIMESTAMPTZ;

  -- AlterTable
  ALTER TABLE "BookRequest" ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMPTZ;

  -- AlterTable
  ALTER TABLE "Problem" ALTER COLUMN "resolved_at" SET DATA TYPE TIMESTAMPTZ;

  -- AlterTable
  ALTER TABLE "Reservation"
    ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMPTZ,
    ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMPTZ;

  -- AlterTable
  ALTER TABLE "Sale" ALTER COLUMN "refunded_at" SET DATA TYPE TIMESTAMPTZ;

  exec_text := format('CREATE VIEW "BookMeta" as %s', book_meta_view_definition);
  EXECUTE exec_text;
END $$;
