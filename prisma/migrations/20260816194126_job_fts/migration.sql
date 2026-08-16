-- Full-Text Search over the job's searchable scalar text.
-- to_tsvector is STABLE (not IMMUTABLE), so it goes through an IMMUTABLE
-- wrapper to build a generated column + GIN index. Skill arrays are matched
-- in queries via array operators / on-the-fly tsvector, not this column.
CREATE FUNCTION "immutable_tsvector"("value" TEXT) RETURNS tsvector
AS $$ SELECT to_tsvector('english', "value") $$
LANGUAGE sql IMMUTABLE;

ALTER TABLE "Job" ADD COLUMN "searchVector" tsvector GENERATED ALWAYS AS (
  "immutable_tsvector"(
    coalesce(title, '') || ' ' ||
    coalesce(summary, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce("companyName", '') || ' ' ||
    coalesce(industry, '')
  )
) STORED;

CREATE INDEX "Job_searchVector_idx" ON "Job" USING GIN ("searchVector");
