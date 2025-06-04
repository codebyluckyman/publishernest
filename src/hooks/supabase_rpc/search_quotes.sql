
CREATE OR REPLACE FUNCTION search_quotes(
    search_title text DEFAULT NULL,
    filter_supplier_name text DEFAULT NULL,
    filter_format_id text DEFAULT NULL
)
RETURNS SETOF quote_management_view AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM quote_management_view qmv
  WHERE
    -- Title search (case-insensitive, partial match)
    (search_title IS NULL OR qmv.title ILIKE '%' || search_title || '%')
    -- Supplier_name filter (exact match, case-insensitive)
    AND (filter_supplier_name IS NULL OR qmv.supplier_name ILIKE filter_supplier_name)
    -- Format filtering: Check if supplier quote has price breaks for the specified format
    -- by following the proper relationship through quote_request_formats
    AND (
      filter_format_id IS NULL OR EXISTS (
        SELECT 1
        FROM supplier_quote_price_breaks sqpb
        JOIN quote_request_formats qrf ON qrf.id = sqpb.quote_request_format_id
        WHERE sqpb.supplier_quote_id = qmv.id
        AND qrf.format_id = filter_format_id::uuid
      )
    );
END;
$$ LANGUAGE plpgsql STABLE;
