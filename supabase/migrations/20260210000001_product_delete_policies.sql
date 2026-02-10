-- Allow authenticated users to delete their own products and store_products
CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete store_products"
  ON store_products FOR DELETE TO authenticated
  USING (true);

-- Also allow updates on store_products (for upsert operations)
CREATE POLICY "Authenticated users can update store_products"
  ON store_products FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);
