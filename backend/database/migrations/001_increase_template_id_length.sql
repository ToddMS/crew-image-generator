-- Migration: Increase template_id column length from VARCHAR(10) to VARCHAR(50)
-- This fixes the constraint error when saving images with longer template IDs

ALTER TABLE SavedImages 
ALTER COLUMN template_id TYPE VARCHAR(50);