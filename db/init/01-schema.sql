-- Travel Dream Database Schema
-- Properties and metadata for Sharm El Sheikh trip planning

-- Main properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    booking_url TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price_eur INTEGER,
    rating DECIMAL(3,1),
    review_count INTEGER,

    -- Status tracking
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'promising', 'reviewed', 'booked', 'rejected')),

    -- Computed/derived
    value_score DECIMAL(5,2),

    -- Our evaluation scores (1-5)
    score_location INTEGER CHECK (score_location BETWEEN 1 AND 5),
    score_value INTEGER CHECK (score_value BETWEEN 1 AND 5),
    score_quality INTEGER CHECK (score_quality BETWEEN 1 AND 5),
    score_reliability INTEGER CHECK (score_reliability BETWEEN 1 AND 5),
    score_separate_sleeping INTEGER CHECK (score_separate_sleeping BETWEEN 1 AND 5),
    score_quietness INTEGER CHECK (score_quietness BETWEEN 1 AND 5),
    score_food_convenience INTEGER CHECK (score_food_convenience BETWEEN 1 AND 5),
    score_amenities INTEGER CHECK (score_amenities BETWEEN 1 AND 5),
    score_overall DECIMAL(3,2),

    -- Key attributes
    is_all_inclusive BOOLEAN,
    is_adults_only BOOLEAN,
    has_twin_beds BOOLEAN,
    has_separate_rooms BOOLEAN,

    -- Location
    area TEXT,
    beach_distance TEXT,

    -- Evaluation
    verdict TEXT,
    pros TEXT[],
    cons TEXT[],
    dealbreakers TEXT[],
    notes TEXT,

    -- JSON for additional structured data
    raw_data JSONB,

    -- Timestamps
    scraped_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Flexible key-value metadata for any property
CREATE TABLE property_metadata (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    value_numeric DECIMAL,
    value_bool BOOLEAN,
    value_json JSONB,
    source TEXT, -- where this data came from (booking, tripadvisor, manual, etc)
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(property_id, key, source)
);

-- Search/trip configurations
CREATE TABLE searches (
    id SERIAL PRIMARY KEY,
    destination TEXT NOT NULL,
    checkin DATE NOT NULL,
    checkout DATE NOT NULL,
    adults INTEGER DEFAULT 2,
    rooms INTEGER DEFAULT 2,
    filters JSONB,
    total_results INTEGER,
    searched_at TIMESTAMP DEFAULT NOW()
);

-- Link properties to searches
CREATE TABLE search_properties (
    search_id INTEGER REFERENCES searches(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    position INTEGER, -- ranking position in search results
    PRIMARY KEY (search_id, property_id)
);

-- Create indexes
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_rating ON properties(rating DESC);
CREATE INDEX idx_properties_price ON properties(price_eur);
CREATE INDEX idx_properties_value_score ON properties(value_score DESC);
CREATE INDEX idx_properties_adults_only ON properties(is_adults_only);
CREATE INDEX idx_metadata_property_key ON property_metadata(property_id, key);
CREATE INDEX idx_properties_raw_data ON properties USING GIN(raw_data);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Calculate value score: (rating * log10(reviews) * 1000) / price
CREATE OR REPLACE FUNCTION calculate_value_score(p_rating DECIMAL, p_reviews INTEGER, p_price INTEGER)
RETURNS DECIMAL AS $$
BEGIN
    IF p_rating IS NULL OR p_reviews IS NULL OR p_price IS NULL OR p_price = 0 THEN
        RETURN NULL;
    END IF;
    RETURN ROUND(((p_rating * LOG(p_reviews + 1) * 1000) / p_price)::numeric, 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate value score
CREATE OR REPLACE FUNCTION update_value_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.value_score = calculate_value_score(NEW.rating, NEW.review_count, NEW.price_eur);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_value_score
    BEFORE INSERT OR UPDATE OF rating, review_count, price_eur ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_value_score();
