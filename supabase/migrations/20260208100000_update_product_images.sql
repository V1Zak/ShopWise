-- Update seed products with category-appropriate placeholder images
-- These use placeholder.co for consistent, reliable placeholders
UPDATE products SET image_url = 'https://placehold.co/400x300/1a332a/13ec80?text=Milk' WHERE id = '00000000-0000-0000-0001-000000000001' AND image_url IS NULL;
UPDATE products SET image_url = 'https://placehold.co/400x300/1a332a/13ec80?text=Eggs' WHERE id = '00000000-0000-0000-0001-000000000002' AND image_url IS NULL;
UPDATE products SET image_url = 'https://placehold.co/400x300/1a332a/13ec80?text=Spinach' WHERE id = '00000000-0000-0000-0001-000000000003' AND image_url IS NULL;
