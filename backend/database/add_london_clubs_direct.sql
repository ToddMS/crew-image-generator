-- Direct SQL to add London rowing clubs to PostgreSQL
-- Replace USER_ID_HERE with your actual user ID before running
-- Example: If your user ID is 5, replace all USER_ID_HERE with 5

-- First check if user exists (replace USER_ID_HERE with actual user ID)
-- SELECT id, name, email FROM Users WHERE id = USER_ID_HERE;

-- Insert London rowing club presets
INSERT INTO ClubPresets (user_id, club_name, primary_color, secondary_color, is_default) VALUES

-- Thames-side clubs
(USER_ID_HERE, 'Thames Rowing Club', '#2563eb', '#1e40af', true),
(USER_ID_HERE, 'London Rowing Club', '#dc2626', '#1f2937', false),
(USER_ID_HERE, 'Leander Club', '#be185d', '#f8fafc', false),
(USER_ID_HERE, 'Tideway Scullers School', '#16a34a', '#1f2937', false),
(USER_ID_HERE, 'Putney Town RC', '#0891b2', '#fbbf24', false),

-- University & College clubs
(USER_ID_HERE, 'Imperial College BC', '#1e40af', '#ef4444', false),
(USER_ID_HERE, 'Kings College London BC', '#7c3aed', '#fbbf24', false),
(USER_ID_HERE, 'University College London BC', '#1f2937', '#fbbf24', false),
(USER_ID_HERE, 'London School of Economics BC', '#dc2626', '#f8fafc', false),
(USER_ID_HERE, 'City of London School BC', '#1e40af', '#dc2626', false),
(USER_ID_HERE, 'Dulwich College BC', '#7c2d12', '#fbbf24', false),
(USER_ID_HERE, 'Guy''s, King''s & St Thomas'' BC', '#1e40af', '#dc2626', false),
(USER_ID_HERE, 'Westminster School BC', '#be185d', '#1f2937', false),
(USER_ID_HERE, 'Westminster School Ladies BC', '#be185d', '#fbbf24', false),

-- Traditional Thames clubs
(USER_ID_HERE, 'Fulham Reach BC', '#059669', '#065f46', false),
(USER_ID_HERE, 'Barn Elms BC', '#7c2d12', '#fbbf24', false),
(USER_ID_HERE, 'Kingston RC', '#1e40af', '#f8fafc', false),
(USER_ID_HERE, 'Mortlake Anglian & Alpha BC', '#0891b2', '#0f172a', false),
(USER_ID_HERE, 'Vesta RC', '#be123c', '#fbbf24', false),
(USER_ID_HERE, 'Thames RC', '#1e3a8a', '#f8fafc', false),
(USER_ID_HERE, 'Quintin BC', '#7c3aed', '#f8fafc', false),

-- Local area clubs
(USER_ID_HERE, 'Hammersmith RC', '#dc2626', '#1f2937', false),
(USER_ID_HERE, 'Wandsworth RC', '#1e40af', '#fbbf24', false),
(USER_ID_HERE, 'Auriol Kensington RC', '#084f29', '#efc0d4', false),
(USER_ID_HERE, 'Star & Arrow Club', '#1f2937', '#fbbf24', false),
(USER_ID_HERE, 'Crabtree RC', '#16a34a', '#f8fafc', false),
(USER_ID_HERE, 'Molesey BC', '#be123c', '#f8fafc', false),
(USER_ID_HERE, 'Walton RC', '#dc2626', '#1f2937', false),
(USER_ID_HERE, 'Twickenham RC', '#059669', '#fbbf24', false),
(USER_ID_HERE, 'Richmond RC', '#7c3aed', '#f8fafc', false);

-- Verify the data was inserted
SELECT COUNT(*) as total_club_presets FROM ClubPresets WHERE user_id = USER_ID_HERE;

-- Show all the clubs we just added
SELECT id, club_name, primary_color, secondary_color, is_default 
FROM ClubPresets 
WHERE user_id = USER_ID_HERE 
ORDER BY club_name;