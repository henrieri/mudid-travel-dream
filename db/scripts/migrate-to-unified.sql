-- Migrate data to unified_properties table
-- Run this after 02-unified-schema.sql

-- Clear existing data
TRUNCATE unified_properties CASCADE;

-- Migrate Booking.com properties (vetted ones)
INSERT INTO unified_properties (
    source,
    source_id,
    source_url,
    name,
    price_eur,
    rating,
    review_count,
    area,
    beach_distance,
    is_beachfront,
    room_type,
    is_all_inclusive,
    is_adults_only,
    status,
    raw_data,
    scraped_at,
    created_at
)
SELECT
    'booking',
    booking_url,
    booking_url,
    name,
    price_eur,
    rating,
    review_count,
    area,
    beach_distance,
    COALESCE(
        (SELECT value_bool FROM property_metadata pm WHERE pm.property_id = p.id AND pm.key = 'is_beachfront' LIMIT 1),
        beach_distance ILIKE '%beachfront%'
    ),
    CASE
        WHEN (SELECT value_bool FROM property_metadata pm WHERE pm.property_id = p.id AND pm.key = 'has_2bedroom_apartment' LIMIT 1) = true THEN 'apartment'
        WHEN (SELECT value_bool FROM property_metadata pm WHERE pm.property_id = p.id AND pm.key LIKE '%villa%' LIMIT 1) = true THEN 'villa'
        WHEN (SELECT value_bool FROM property_metadata pm WHERE pm.property_id = p.id AND pm.key LIKE '%suite%' LIMIT 1) = true THEN 'suite'
        ELSE 'standard'
    END,
    is_all_inclusive,
    is_adults_only,
    status,
    raw_data,
    scraped_at,
    created_at
FROM properties p
WHERE status IN ('promising', 'reviewed');

-- Migrate Airbnb properties
INSERT INTO unified_properties (
    source,
    source_id,
    source_url,
    name,
    price_eur,
    rating,
    review_count,
    is_beachfront,
    room_type,
    bedroom_count,
    has_separate_bedrooms,
    thumbnail_url,
    images,
    status,
    scraped_at,
    created_at
)
SELECT
    'airbnb',
    airbnb_id,
    airbnb_url,
    name,
    price_total_eur::integer,
    rating,
    review_count,
    has_beach_access,
    'apartment',
    bedrooms,
    bedrooms >= 2,
    thumbnail_url,
    COALESCE(images, '[]'::jsonb),
    CASE WHEN status = 'premium' THEN 'promising' ELSE 'new' END,
    scraped_at,
    scraped_at
FROM airbnb_properties;

-- Migrate metadata from property_metadata for Booking.com properties
INSERT INTO unified_metadata (property_id, key, value, value_numeric, value_bool, value_json, source)
SELECT
    up.id,
    pm.key,
    pm.value,
    pm.value_numeric,
    pm.value_bool,
    pm.value_json,
    pm.source
FROM property_metadata pm
JOIN properties p ON p.id = pm.property_id
JOIN unified_properties up ON up.source = 'booking' AND up.source_id = p.booking_url
ON CONFLICT (property_id, key, source) DO UPDATE SET
    value = EXCLUDED.value,
    value_numeric = EXCLUDED.value_numeric,
    value_bool = EXCLUDED.value_bool;

-- Update Henri scores for unified properties from metadata
UPDATE unified_properties up
SET
    henri_score = (SELECT value_numeric FROM unified_metadata WHERE property_id = up.id AND key = 'henri_score' LIMIT 1),
    henri_tier = (SELECT value FROM unified_metadata WHERE property_id = up.id AND key = 'henri_tier' LIMIT 1),
    score_snoring = (SELECT value_numeric FROM unified_metadata WHERE property_id = up.id AND key = 'score_snoring' LIMIT 1),
    score_beach = (SELECT value_numeric FROM unified_metadata WHERE property_id = up.id AND key = 'score_beach' LIMIT 1),
    score_rating = (SELECT value_numeric FROM unified_metadata WHERE property_id = up.id AND key = 'score_rating' LIMIT 1),
    score_adults = (SELECT value_numeric FROM unified_metadata WHERE property_id = up.id AND key = 'score_adults' LIMIT 1),
    score_allinc = (SELECT value_numeric FROM unified_metadata WHERE property_id = up.id AND key = 'score_allinc' LIMIT 1),
    score_amenities = (SELECT value_numeric FROM unified_metadata WHERE property_id = up.id AND key = 'score_amenities' LIMIT 1),
    score_reliability = (SELECT value_numeric FROM unified_metadata WHERE property_id = up.id AND key = 'score_reliability' LIMIT 1),
    score_breakdown = (SELECT value FROM unified_metadata WHERE property_id = up.id AND key = 'henri_score_breakdown' LIMIT 1)
WHERE source = 'booking';

-- Mark Sharm Hills as verified (TRUE 2BR)
UPDATE unified_properties
SET
    verified = true,
    verified_at = NOW(),
    verified_notes = 'Verified via Booking.com live check Jan 17, 2026 - TRUE 2BR apartment',
    bedroom_count = 2,
    has_separate_bedrooms = true,
    room_size_sqm = 96,
    bed_configuration = 'BR1: Queen, BR2: 2 Twin',
    status = 'verified'
WHERE name ILIKE '%Sharm Hills%';

-- Mark Sunrise Montemare as verified (NOT true 2BR)
UPDATE unified_properties
SET
    verified = true,
    verified_at = NOW(),
    verified_notes = 'Family Suite is 55m² single room with twin beds - NOT separate bedrooms',
    has_separate_bedrooms = false,
    room_size_sqm = 55,
    bed_configuration = 'Single room: King OR Twin beds'
WHERE name ILIKE '%Sunrise Montemare%';

-- Calculate Henri Score for Airbnb properties
UPDATE unified_properties
SET
    henri_score = CASE
        WHEN bedroom_count >= 2 AND has_separate_bedrooms = true THEN 35 ELSE 0 END  -- snoring
        + CASE WHEN is_beachfront = true THEN 15 ELSE 0 END  -- beach
        + CASE
            WHEN rating >= 4.9 THEN 15
            WHEN rating >= 4.7 THEN 12
            WHEN rating >= 4.5 THEN 8
            WHEN rating >= 4.0 THEN 4
            ELSE 0 END  -- rating (Airbnb uses 5-point scale)
        + CASE
            WHEN review_count >= 100 THEN 5
            WHEN review_count >= 50 THEN 4
            WHEN review_count >= 20 THEN 3
            WHEN review_count >= 10 THEN 2
            ELSE 0 END,  -- reliability
    henri_tier = CASE
        WHEN henri_score >= 80 THEN 'Excellent'
        WHEN henri_score >= 65 THEN 'Very Good'
        WHEN henri_score >= 50 THEN 'Good'
        WHEN henri_score >= 35 THEN 'Average'
        ELSE 'Poor' END,
    score_snoring = CASE WHEN bedroom_count >= 2 AND has_separate_bedrooms = true THEN 35 ELSE 0 END,
    score_beach = CASE WHEN is_beachfront = true THEN 15 ELSE 0 END,
    score_rating = CASE
        WHEN rating >= 4.9 THEN 15
        WHEN rating >= 4.7 THEN 12
        WHEN rating >= 4.5 THEN 8
        WHEN rating >= 4.0 THEN 4
        ELSE 0 END
WHERE source = 'airbnb';

-- Recalculate tier after score update
UPDATE unified_properties
SET henri_tier = CASE
    WHEN henri_score >= 80 THEN 'Excellent'
    WHEN henri_score >= 65 THEN 'Very Good'
    WHEN henri_score >= 50 THEN 'Good'
    WHEN henri_score >= 35 THEN 'Average'
    ELSE 'Poor' END
WHERE source = 'airbnb';

-- Output summary
SELECT
    source,
    COUNT(*) as total,
    COUNT(CASE WHEN henri_score IS NOT NULL THEN 1 END) as scored,
    COUNT(CASE WHEN verified = true THEN 1 END) as verified,
    ROUND(AVG(henri_score), 1) as avg_score
FROM unified_properties
GROUP BY source
ORDER BY source;

-- Show top 10 overall
SELECT
    RANK() OVER (ORDER BY henri_score DESC NULLS LAST) as rank,
    source,
    name,
    price_eur,
    rating,
    henri_score,
    henri_tier,
    CASE WHEN has_separate_bedrooms THEN '✓ 2BR' ELSE '✗' END as separate_br,
    CASE WHEN is_beachfront THEN '✓' ELSE '' END as beachfront,
    CASE WHEN verified THEN '✓' ELSE '' END as verified
FROM unified_properties
WHERE henri_score IS NOT NULL
ORDER BY henri_score DESC NULLS LAST
LIMIT 15;
