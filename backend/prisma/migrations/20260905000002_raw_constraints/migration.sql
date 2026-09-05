                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              CREATE OR REPLACE FUNCTION check_entry_balanced() RETURNS trigger AS $$
DECLARE d NUMERIC; c NUMERIC;
BEGIN
  SELECT COALESCE(SUM(debit),0), COALESCE(SUM(credit),0) INTO d, c
  FROM "JournalItem" WHERE "entryId" = NEW.id;
  IF (SELECT status FROM "JournalEntry" WHERE id = NEW.id) = 'POSTED'
     AND d <> c THEN
    RAISE EXCEPTION 'Journal entry % is unbalanced: debit=% credit=%',
      NEW.id, d, c;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_entry_balanced
  AFTER INSERT OR UPDATE ON "JournalEntry"
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION check_entry_balanced();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_debit_or_credit'
  ) THEN
    ALTER TABLE "JournalItem" ADD CONSTRAINT chk_debit_or_credit
      CHECK ((debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_invoice_unpaid ON "Invoice"("companyId", "dueDate")
  WHERE "paymentStatus" <> 'PAID';
CREATE INDEX IF NOT EXISTS idx_contact_active ON "Contact"("companyId", name)
  WHERE "isArchived" = false;
