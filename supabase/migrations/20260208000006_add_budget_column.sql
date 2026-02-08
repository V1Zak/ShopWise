-- Add budget column to shopping_lists
ALTER TABLE shopping_lists ADD COLUMN budget numeric(10,2) DEFAULT NULL;
