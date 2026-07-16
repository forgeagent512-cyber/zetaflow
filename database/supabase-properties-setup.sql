-- ============================================
-- Workflow 3: Property Matching System
-- Supabase Table Setup
-- ============================================
-- Yeh SQL Supabase dashboard mein "SQL Editor" tab mein paste karke Run karo

CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  project_name TEXT NOT NULL,
  developer TEXT,
  area TEXT NOT NULL,
  property_type TEXT NOT NULL,       -- apartment | villa | townhouse
  bedrooms INT NOT NULL,
  price_aed NUMERIC NOT NULL,
  payment_options TEXT,               -- cash | mortgage | cash/mortgage
  status TEXT DEFAULT 'ready',        -- ready | off-plan
  amenities TEXT,
  roi_percent NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Demo listings (same 15 jo demo package mein the)
INSERT INTO properties (project_name, developer, area, property_type, bedrooms, price_aed, payment_options, status) VALUES
('Marina Gate', 'Select Group', 'Dubai Marina', 'apartment', 2, 2800000, 'cash/mortgage', 'ready'),
('Emaar Beachfront', 'Emaar', 'Dubai Marina', 'apartment', 2, 3200000, 'cash', 'ready'),
('Address Marina', 'Emaar', 'Dubai Marina', 'apartment', 3, 4500000, 'mortgage', 'ready'),
('Downtown Views II', 'Emaar', 'Downtown Dubai', 'apartment', 1, 1900000, 'cash/mortgage', 'ready'),
('Burj Vista', 'Emaar', 'Downtown Dubai', 'apartment', 2, 3600000, 'cash', 'ready'),
('Opera Grand', 'Emaar', 'Downtown Dubai', 'apartment', 3, 5800000, 'mortgage', 'off-plan'),
('Bay Square', 'Meraas', 'Business Bay', 'apartment', 1, 1400000, 'cash/mortgage', 'ready'),
('The Executive Tower', 'DAMAC', 'Business Bay', 'apartment', 2, 2300000, 'mortgage', 'ready'),
('Peninsula Two', 'Select Group', 'Business Bay', 'apartment', 2, 2750000, 'cash', 'off-plan'),
('Palm Tower Residences', 'Nakheel', 'Palm Jumeirah', 'apartment', 2, 4900000, 'cash', 'ready'),
('Shoreline Apartments', 'Nakheel', 'Palm Jumeirah', 'villa', 4, 8500000, 'cash', 'ready'),
('FIVE Palm', 'FIVE Holdings', 'Palm Jumeirah', 'apartment', 1, 2600000, 'mortgage', 'ready'),
('JVC Belgravia', 'Ellington', 'JVC', 'apartment', 1, 850000, 'cash/mortgage', 'ready'),
('JVC District 12', 'Nakheel', 'JVC', 'townhouse', 3, 1950000, 'mortgage', 'ready'),
('JVC Green Views', 'Diamond Developers', 'JVC', 'apartment', 2, 1200000, 'cash', 'off-plan');

-- Verify
SELECT * FROM properties;
