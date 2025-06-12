
-- Add new columns to the sales_orders table
ALTER TABLE public.sales_orders 
ADD COLUMN customer_purchase_order text,
ADD COLUMN customer_contact_name text,
ADD COLUMN fob_date date,
ADD COLUMN departing_port text,
ADD COLUMN sales_person text;
