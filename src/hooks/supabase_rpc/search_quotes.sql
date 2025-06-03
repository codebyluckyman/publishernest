
CREATE OR REPLACE FUNCTION search_quotes(
    search_title text DEFAULT NULL,
    filter_supplier_name text DEFAULT NULL,
    filter_format_id text DEFAULT NULL
)
RETURNS SETOF quote_management_view AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM quote_management_view
  WHERE
    -- Title search (case-insensitive, partial match)
    (search_title IS NULL OR title ILIKE '%' || search_title || '%')
    -- Supplier_name filter (exact match, case-insensitive)
    AND (filter_supplier_name IS NULL OR supplier_name ILIKE filter_supplier_name)
    -- format_id in formats array
    AND (
      filter_format_id IS NULL OR EXISTS (
        SELECT 1
        FROM json_array_elements(formats) AS elem
        WHERE (elem->'format'->>'id') = filter_format_id
      )
    );
END;
$$ LANGUAGE plpgsql STABLE;
