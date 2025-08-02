# OpenSanctions API Integration Plan

## Overview
Integrate OpenSanctions API to check if companies or their officers are under sanctions and display a warning badge.

## API Information
- **Base URL**: https://api.opensanctions.org/
- **Documentation**: https://api.opensanctions.org/
- **Examples**: https://github.com/opensanctions/api-examples
- **Pricing**: €0.10 per API call (free for non-commercial use)
- **Trial**: 30-day trial with business email signup

## Implementation Plan

### Phase 1: API Research & Testing
1. Sign up for API key at https://www.opensanctions.org/api/
2. Test basic API endpoints:
   - `/search` - Search for entities by name
   - `/match` - Match entities against sanctions lists
3. Understand response format and sanctions indicators

### Phase 2: Proxy Server Integration
1. Add OpenSanctions API key to `.env` file
2. Create new endpoint in proxy-server.js:
   - `/api/sanctions/check/:companyName`
   - `/api/sanctions/officer/:officerName`
3. Implement caching to reduce API calls (€0.10 each)

### Phase 3: Frontend Integration
1. Design sanctions badge:
   - Red warning icon with "Sanctions Alert"
   - Tooltip with details
   - Link to full sanctions information
2. Add sanctions check when displaying:
   - Company cards
   - Company modal
   - Officer information

### Phase 4: Testing
1. Test with known sanctioned entities
2. Test API error handling
3. Test caching mechanism
4. Verify badge display

## Technical Implementation

### Badge Design (HTML/CSS)
```html
<div class="sanctions-badge" title="This entity appears on sanctions lists">
  ⚠️ Sanctions Alert
</div>
```

### API Integration Flow
1. User searches for company
2. Frontend sends company name to proxy server
3. Proxy server checks cache
4. If not cached, call OpenSanctions API
5. Return sanctions status
6. Display badge if sanctioned

## Considerations
- Cache results for 24 hours to minimize costs
- Only check when user views detailed information
- Handle API errors gracefully
- Comply with OpenSanctions licensing

## Next Steps
1. Register for API key
2. Test API endpoints with curl
3. Implement proxy server endpoint
4. Add frontend badge display