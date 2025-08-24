-- Migration: Add London Rowing Club Presets
-- Date: 2025-08-22
-- Description: Insert London rowing clubs with authentic colors

-- First, we'll create a temp user for these presets (assuming no specific user owns them)
-- You can update user_id later to assign to specific users

-- Insert London rowing club presets
-- Note: Replace user_id = 1 with the appropriate user ID for your system
INSERT INTO ClubPresets (user_id, club_name, primary_color, secondary_color, is_default) VALUES
-- Thames-side clubs
(1, 'Thames Rowing Club', '#2563eb', '#1e40af', true),
(1, 'London Rowing Club', '#dc2626', '#1f2937', false),
(1, 'Leander Club', '#be185d', '#f8fafc', false),
(1, 'Tideway Scullers School', '#16a34a', '#1f2937', false),
(1, 'Putney Town RC', '#0891b2', '#fbbf24', false),

-- University & College clubs
(1, 'Imperial College BC', '#1e40af', '#ef4444', false),
(1, 'Kings College London BC', '#7c3aed', '#fbbf24', false),
(1, 'University College London BC', '#1f2937', '#fbbf24', false),
(1, 'London School of Economics BC', '#dc2626', '#f8fafc', false),
(1, 'City of London School BC', '#1e40af', '#dc2626', false),
(1, 'Dulwich College BC', '#7c2d12', '#fbbf24', false),
(1, 'Guy''s, King''s & St Thomas'' BC', '#1e40af', '#dc2626', false),
(1, 'Westminster School BC', '#be185d', '#1f2937', false),
(1, 'Westminster School Ladies BC', '#be185d', '#fbbf24', false),

-- Traditional Thames clubs
(1, 'Fulham Reach BC', '#059669', '#065f46', false),
(1, 'Barn Elms BC', '#7c2d12', '#fbbf24', false),
(1, 'Kingston RC', '#1e40af', '#f8fafc', false),
(1, 'Mortlake Anglian & Alpha BC', '#0891b2', '#0f172a', false),
(1, 'Vesta RC', '#be123c', '#fbbf24', false),
(1, 'Thames RC', '#1e3a8a', '#f8fafc', false),
(1, 'Quintin BC', '#7c3aed', '#f8fafc', false),

-- Local area clubs
(1, 'Hammersmith RC', '#dc2626', '#1f2937', false),
(1, 'Wandsworth RC', '#1e40af', '#fbbf24', false),
(1, 'Auriol Kensington RC', '#084f29', '#efc0d4', false),
(1, 'Star & Arrow Club', '#1f2937', '#fbbf24', false),
(1, 'Crabtree RC', '#16a34a', '#f8fafc', false),
(1, 'Molesey BC', '#be123c', '#f8fafc', false),
(1, 'Walton RC', '#dc2626', '#1f2937', false),
(1, 'Twickenham RC', '#059669', '#fbbf24', false),
(1, 'Richmond RC', '#7c3aed', '#f8fafc', false);

-- Note: If you get a conflict error, it means some clubs already exist
-- You can either delete existing entries or modify this script to update instead

-- Add indexes if they don't exist (they should already exist from schema)
CREATE INDEX IF NOT EXISTS idx_club_presets_club_name ON ClubPresets(club_name);
CREATE INDEX IF NOT EXISTS idx_club_presets_colors ON ClubPresets(primary_color, secondary_color);