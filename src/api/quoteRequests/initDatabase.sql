
-- Function to insert quote request format products
CREATE OR REPLACE FUNCTION public.insert_quote_request_format_products(products_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.quote_request_format_products 
    (quote_request_format_id, product_id, quantity, notes)
  SELECT 
    (prod->>'quote_request_format_id')::uuid,
    (prod->>'product_id')::uuid,
    (prod->>'quantity')::int,
    (prod->>'notes')::text
  FROM jsonb_array_elements(products_data) AS prod;
END;
$$;

-- Function to update quote request format products
CREATE OR REPLACE FUNCTION public.update_quote_request_format_products(format_id uuid, products_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete existing products for this format
  DELETE FROM public.quote_request_format_products
  WHERE quote_request_format_id = format_id;
  
  -- Insert new products if provided
  IF jsonb_array_length(products_data) > 0 THEN
    INSERT INTO public.quote_request_format_products 
      (quote_request_format_id, product_id, quantity, notes)
    SELECT 
      (prod->>'quote_request_format_id')::uuid,
      (prod->>'product_id')::uuid,
      (prod->>'quantity')::int,
      (prod->>'notes')::text
    FROM jsonb_array_elements(products_data) AS prod;
  END IF;
END;
$$;
