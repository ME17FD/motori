-- ─── PARTS : full-text search vector ─────────────────────────────────────────
-- Adds a tsvector column generated automatically from the properties JSONB field.
-- PostgreSQL recomputes this column on every INSERT/UPDATE — no Spring involvement needed.
-- IF NOT EXISTS ensures idempotency: safe to run on every application startup.
ALTER TABLE parts ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', properties::text)
    ) STORED;

-- GIN index enables O(log n) full-text search on parts.search_vector.
-- Essential for performance on large tables.
CREATE INDEX IF NOT EXISTS idx_parts_search ON parts USING GIN(search_vector);


-- ─── EQUIPEMENT : full-text search vector ────────────────────────────────────
-- Same pattern applied to the equipement table.
ALTER TABLE equipement ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', properties::text)
    ) STORED;

-- GIN index for equipement full-text search.
CREATE INDEX IF NOT EXISTS idx_equipement_search ON equipement USING GIN(search_vector);