# Hotel Booking APIs - Research

## Major Hotel Booking API Providers

### 1. Amadeus Hotel API ⭐ BEST FOR DEVELOPERS
- **Website**: https://developers.amadeus.com/self-service/category/hotels
- **Coverage**: 150,000+ hotels worldwide
- **Free Tier**: YES - Free monthly request quota in both test and production
- **Getting Started**: Less than 3 minutes to start testing
- **APIs Available**:
  - Hotel Search API
  - Hotel Booking API
  - Hotel Ratings API
- **Pricing**: Free tier + pay only for calls exceeding monthly limit
- **Best For**: Independent developers and start-ups

### 2. Booking.com Demand API
- **Website**: https://developers.booking.com/
- **Coverage**: Massive inventory (accommodations, car rentals, flights)
- **API Version**: V3 (rebuilt from ground up)
- **Type**: RESTful API with JSON responses
- **Best For**: Affiliate partners
- **Features**: Search, retrieve details, check availability, manage bookings, reports

### 3. Expedia Rapid API
- **Website**: https://partner.expediagroup.com/
- **Coverage**: 700,000 accommodations in 243 countries
- **Property Types**: Apartments, hotels, houseboats, etc.
- **Status**: Rapid Car API in beta (full launch 2026)
- **Best For**: Travel agencies and larger integrations

### 4. Airbnb API ⚠️
- **Status**: NOT CURRENTLY AVAILABLE
- **Note**: Not onboarding new API partners
- **Access**: Team proactively contacts potential collaborators

### 5. Hotelbeds API
- **Features**: Large inventory, modern APIs, quality customer service
- **Type**: Wholesaler
- **Best For**: Professional travel businesses

### 6. Agoda API
- **Coverage**: Millions of hotels
- **Regional Strength**: Asia-Pacific markets
- **Best For**: Businesses scaling in APAC region

### 7. RateHawk API
- **Features**: Large inventory, real-time price intelligence
- **Coverage**: Global hotel chains
- **Best For**: Price comparison

### 8. Hotelston API
- **Features**: Easy integration, beginner-friendly documentation
- **Pricing**: Competitive
- **Best For**: Developers new to hotel APIs

### 9. Priceline API
- **Coverage**: 700,000+ properties in 20,000 locations
- **Best For**: Large inventory needs

### 10. Makcorps API
- **Features**: Real-time price comparison from 200+ OTAs
- **Sources**: Booking.com, Expedia, and more
- **Best For**: Price aggregation

## RapidAPI Marketplace

**Website**: https://rapidapi.com/collection/hotels-apis

- **Free Tier**: Available with free RapidAPI account
- **Popular APIs**:
  - Hotels.com API (Hotels4) - Real-time data
  - Skyscanner API - Free to use
  - Various other hotel search APIs
- **Testing**: Easy to test with built-in tools
- **Best For**: Quick prototyping and testing

## Google Hotel APIs

**Website**: https://developers.google.com/hotels

- Integration with Google's hotel search ecosystem
- Best for businesses wanting Google integration

## Inventory Size Reality Check ⚠️

**Consumer Sites vs APIs:**

| Provider | Inventory Size | API Access |
|----------|---------------|------------|
| **Booking.com** (website) | 2.5-3.4M properties (475K hotels) | ❌ Not public - affiliate partners only (not accepting new registrations) |
| **Airbnb** (website) | Millions of properties | ❌ Not accepting new API partners |
| **Expedia API** | 700,000 properties | ✅ Available via Rapid API |
| **Amadeus Self-Service** | 150,000 hotels | ✅ Free tier available |
| **Amadeus Enterprise** | 1.5-2.3M properties | ✅ Paid tier |

**The honest answer**: No, easily accessible free APIs don't match Booking.com or Airbnb's inventory.

## Recommendation for This Project

**Realistic approach for personal travel planning:**

1. **Use Expedia Rapid API** (700K properties - best free/accessible option)
2. **Amadeus Self-Service** (150K hotels, good for traditional hotels)
3. **Manual search on Booking.com/Airbnb** for comparison
4. **Consider**: Price aggregator APIs like Makcorps that query multiple OTAs

**For maximum coverage**: Use APIs for initial search, then cross-reference with Booking.com/Airbnb websites manually.

## Integration Process

1. Choose a provider
2. Sign up and get API key from developer portal
3. Test endpoints using:
   - Postman
   - RapidAPI testing tools
   - Swagger
4. Connect to your application
5. Automate: search → pricing → availability → booking

## Next Steps for Sharm el Sheikh Trip

- [ ] Sign up for Amadeus free tier
- [ ] Test hotel search API for Sharm el Sheikh (Feb 15-22, 2026)
- [ ] Compare prices across different APIs
- [ ] Build simple search interface
- [ ] Consider integrating with mudid ecosystem via `x` operations
