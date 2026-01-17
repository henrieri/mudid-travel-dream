-- Unified Properties Schema
-- Combines Booking.com and Airbnb properties for Egypt trip planning

-- Unified properties table
CREATE TABLE IF NOT EXISTS unified_properties (
    id SERIAL PRIMARY KEY,

    -- Source tracking
    source TEXT NOT NULL CHECK (source IN ('booking', 'airbnb', 'direct')),
    source_id TEXT NOT NULL, -- booking_url or airbnb_id
    source_url TEXT,

    -- Core property info
    name TEXT NOT NULL,
    price_eur INTEGER,
    rating DECIMAL(3,2),
    review_count INTEGER,

    -- Location
    area TEXT,
    beach_distance TEXT,
    is_beachfront BOOLEAN,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    -- Room configuration (verified)
    room_type TEXT, -- 'standard', 'suite', 'apartment', 'villa'
    bedroom_count INTEGER,
    has_separate_bedrooms BOOLEAN, -- VERIFIED separate rooms with doors
    bed_configuration TEXT, -- e.g., "BR1: Queen, BR2: 2 Twin"
    room_size_sqm INTEGER,

    -- Key attributes
    is_all_inclusive BOOLEAN,
    is_adults_only BOOLEAN,

    -- Henri Score (calculated)
    henri_score INTEGER,
    henri_tier TEXT CHECK (henri_tier IN ('Excellent', 'Very Good', 'Good', 'Average', 'Poor')),
    score_snoring INTEGER,
    score_beach INTEGER,
    score_rating INTEGER,
    score_adults INTEGER,
    score_allinc INTEGER,
    score_amenities INTEGER,
    score_reliability INTEGER,
    score_breakdown TEXT,

    -- Verification status
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    verified_notes TEXT,

    -- Images
    thumbnail_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,

    -- Status
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'promising', 'vetted', 'verified', 'recommended', 'booked', 'rejected')),

    -- User ratings (Henri & Evelina)
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,

    -- Raw data
    raw_data JSONB,

    -- Timestamps
    scraped_at TIMESTAMP,
    price_updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Ensure unique per source
    UNIQUE(source, source_id)
);

-- Unified metadata table
CREATE TABLE IF NOT EXISTS unified_metadata (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES unified_properties(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    value_numeric DECIMAL,
    value_bool BOOLEAN,
    value_json JSONB,
    source TEXT, -- 'scraped', 'manual', 'calculated', 'verified'
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(property_id, key, source)
);

-- User feedback/comments table
CREATE TABLE IF NOT EXISTS property_feedback (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES unified_properties(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL, -- 'henri' or 'evelina'
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    pros TEXT[],
    cons TEXT[],
    would_book BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Price history tracking
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES unified_properties(id) ON DELETE CASCADE,
    price_eur INTEGER NOT NULL,
    meal_plan TEXT, -- 'room_only', 'breakfast', 'half_board', 'all_inclusive'
    room_type TEXT,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_unified_source ON unified_properties(source);
CREATE INDEX IF NOT EXISTS idx_unified_status ON unified_properties(status);
CREATE INDEX IF NOT EXISTS idx_unified_henri_score ON unified_properties(henri_score DESC);
CREATE INDEX IF NOT EXISTS idx_unified_price ON unified_properties(price_eur);
CREATE INDEX IF NOT EXISTS idx_unified_rating ON unified_properties(rating DESC);
CREATE INDEX IF NOT EXISTS idx_unified_verified ON unified_properties(verified);
CREATE INDEX IF NOT EXISTS idx_unified_favorite ON unified_properties(is_favorite);
CREATE INDEX IF NOT EXISTS idx_unified_metadata_key ON unified_metadata(property_id, key);
CREATE INDEX IF NOT EXISTS idx_feedback_property ON property_feedback(property_id);
CREATE INDEX IF NOT EXISTS idx_price_history_property ON price_history(property_id, recorded_at DESC);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_unified_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS unified_properties_updated_at ON unified_properties;
CREATE TRIGGER unified_properties_updated_at
    BEFORE UPDATE ON unified_properties
    FOR EACH ROW
    EXECUTE FUNCTION update_unified_updated_at();

-- Henri Score calculation function
CREATE OR REPLACE FUNCTION calculate_henri_score(
    p_bedroom_count INTEGER,
    p_has_separate_bedrooms BOOLEAN,
    p_room_type TEXT,
    p_is_beachfront BOOLEAN,
    p_beach_distance TEXT,
    p_rating DECIMAL,
    p_is_adults_only BOOLEAN,
    p_is_all_inclusive BOOLEAN,
    p_review_count INTEGER
) RETURNS TABLE(
    total_score INTEGER,
    tier TEXT,
    snoring_pts INTEGER,
    beach_pts INTEGER,
    rating_pts INTEGER,
    adults_pts INTEGER,
    allinc_pts INTEGER,
    amenities_pts INTEGER,
    reliability_pts INTEGER
) AS $$
DECLARE
    v_snoring INTEGER := 0;
    v_beach INTEGER := 0;
    v_rating INTEGER := 0;
    v_adults INTEGER := 0;
    v_allinc INTEGER := 0;
    v_amenities INTEGER := 0;
    v_reliability INTEGER := 0;
    v_total INTEGER;
    v_tier TEXT;
BEGIN
    -- Snoring isolation (35 pts max)
    IF p_bedroom_count >= 2 AND (p_room_type IN ('apartment', 'villa') OR p_has_separate_bedrooms = true) THEN
        v_snoring := 35;
    ELSIF p_bedroom_count >= 2 AND p_room_type = 'suite' THEN
        v_snoring := 30;
    ELSIF p_room_type = 'suite' THEN
        v_snoring := 20;
    END IF;

    -- Beach access (15 pts max)
    IF p_is_beachfront = true THEN
        v_beach := 15;
    ELSIF p_beach_distance IS NOT NULL THEN
        -- Parse distance
        IF p_beach_distance ~* '\d+\s*m' THEN
            IF (regexp_replace(p_beach_distance, '[^0-9]', '', 'g'))::int <= 100 THEN
                v_beach := 12;
            ELSIF (regexp_replace(p_beach_distance, '[^0-9]', '', 'g'))::int <= 500 THEN
                v_beach := 8;
            ELSE
                v_beach := 5;
            END IF;
        END IF;
    END IF;

    -- Rating quality (15 pts max)
    IF p_rating >= 9.5 THEN v_rating := 15;
    ELSIF p_rating >= 9.0 THEN v_rating := 12;
    ELSIF p_rating >= 8.5 THEN v_rating := 8;
    ELSIF p_rating >= 8.0 THEN v_rating := 4;
    END IF;

    -- Adults-only (10 pts)
    IF p_is_adults_only = true THEN v_adults := 10; END IF;

    -- All-inclusive (10 pts)
    IF p_is_all_inclusive = true THEN v_allinc := 10; END IF;

    -- Reliability (5 pts max)
    IF p_review_count >= 2000 THEN v_reliability := 5;
    ELSIF p_review_count >= 1000 THEN v_reliability := 4;
    ELSIF p_review_count >= 500 THEN v_reliability := 3;
    ELSIF p_review_count >= 100 THEN v_reliability := 2;
    END IF;

    v_total := v_snoring + v_beach + v_rating + v_adults + v_allinc + v_amenities + v_reliability;

    -- Tier
    IF v_total >= 80 THEN v_tier := 'Excellent';
    ELSIF v_total >= 65 THEN v_tier := 'Very Good';
    ELSIF v_total >= 50 THEN v_tier := 'Good';
    ELSIF v_total >= 35 THEN v_tier := 'Average';
    ELSE v_tier := 'Poor';
    END IF;

    RETURN QUERY SELECT v_total, v_tier, v_snoring, v_beach, v_rating, v_adults, v_allinc, v_amenities, v_reliability;
END;
$$ LANGUAGE plpgsql;
