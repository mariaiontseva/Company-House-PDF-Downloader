# OpenSanctions API Integration Guide

## Current Test Data
Our test dataset only includes these 9 entities:
- Vladimir Putin
- Roman Abramovich  
- Oleg Deripaska
- Viktor Vekselberg
- Alisher Usmanov
- Gazprom
- Rosneft
- Sberbank
- VTB Bank

## Steps to Switch to Real OpenSanctions API

### 1. Get API Key
1. Go to https://www.opensanctions.org/api/
2. Sign up for an account
3. Choose a plan (they have free tier for testing)
4. Get your API key

### 2. Add API Key to Railway Environment
1. Go to your Railway dashboard
2. Click on the proxy server service
3. Go to Variables tab
4. Add new variable:
   ```
   OPENSANCTIONS_API_KEY=your_actual_api_key_here
   ```

### 3. Update proxy-server.js

Replace the current test implementation with this real API code:

```javascript
// Sanctions check endpoint - REAL IMPLEMENTATION
app.get('/api/sanctions/check/:name', async (req, res) => {
    const { name } = req.params;
    
    try {
        // Check if we have API key
        if (!process.env.OPENSANCTIONS_API_KEY) {
            // Fall back to test data if no API key
            return res.json(getTestData(name));
        }
        
        // Real OpenSanctions API call
        const response = await fetch('https://api.opensanctions.org/match/default', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENSANCTIONS_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                queries: {
                    q1: {
                        schema: 'Company',
                        properties: {
                            name: [name]
                        }
                    }
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenSanctions API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process OpenSanctions response
        const results = data.responses?.q1?.results || [];
        const topMatch = results[0];
        
        if (topMatch && topMatch.score > 0.7) { // 70% match threshold
            const entity = topMatch.entity;
            
            // Extract sanctions lists
            const sanctions = entity.datasets || [];
            const sanctionsList = sanctions.map(s => {
                if (s.includes('eu_')) return 'EU Sanctions';
                if (s.includes('gb_')) return 'UK Sanctions';
                if (s.includes('us_')) return 'US OFAC';
                return s;
            }).filter(Boolean);
            
            return res.json({
                status: 'success',
                data: {
                    entity: name,
                    sanctioned: true,
                    lists: [...new Set(sanctionsList)],
                    score: topMatch.score,
                    matchedName: entity.caption,
                    aliases: entity.properties?.alias || [],
                    lastUpdated: new Date().toISOString(),
                    source: 'opensanctions',
                    details: {
                        datasets: entity.datasets,
                        schema: entity.schema,
                        properties: entity.properties
                    }
                }
            });
        }
        
        // No match found
        return res.json({
            status: 'success',
            data: {
                entity: name,
                sanctioned: false,
                lists: [],
                lastUpdated: new Date().toISOString(),
                source: 'opensanctions'
            }
        });
        
    } catch (error) {
        console.error('OpenSanctions API error:', error);
        
        // Fall back to test data on error
        return res.json(getTestData(name));
    }
});

// Helper function for test data fallback
function getTestData(name) {
    const testSanctionedEntities = [
        'vladimir putin',
        'roman abramovich',
        'oleg deripaska',
        'viktor vekselberg',
        'alisher usmanov',
        'gazprom',
        'rosneft',
        'sberbank',
        'vtb bank'
    ];
    
    const normalizedName = name.toLowerCase().trim();
    const isSanctioned = testSanctionedEntities.some(entity => 
        normalizedName.includes(entity) || entity.includes(normalizedName)
    );
    
    return {
        status: 'success',
        data: {
            entity: name,
            sanctioned: isSanctioned,
            lists: isSanctioned ? ['EU Sanctions', 'UK Sanctions', 'US OFAC'] : [],
            lastUpdated: new Date().toISOString(),
            source: 'simulated'
        }
    };
}
```

### 4. Enhanced Data with Real API

With the real API, you'll get:

1. **Match Score** - Confidence level (0-1)
2. **Exact Dataset Names** - e.g., "eu_fsf", "gb_hmt_sanctions", "us_ofac_sdn"
3. **Aliases** - Alternative names for the entity
4. **Properties** - Additional data like:
   - Country
   - Address
   - Birth date (for individuals)
   - Incorporation date (for companies)
   - National IDs
5. **Schema Type** - Person, Company, Organization, etc.
6. **Related Entities** - Connected people/companies

### 5. Update Frontend (Optional)

To display the additional data, update the sanctions badge tooltip:

```javascript
sanctionsBadge.title = `
Listed on: ${sanctionsData.lists.join(', ')}
Match Score: ${(sanctionsData.score * 100).toFixed(0)}%
Aliases: ${sanctionsData.aliases?.join(', ') || 'None'}
`;
```

### 6. Test the Integration

```bash
# Test with a known sanctioned entity
curl http://localhost:3002/api/sanctions/check/Gazprom

# Test with a non-sanctioned entity  
curl http://localhost:3002/api/sanctions/check/Apple%20Inc
```

## API Pricing

OpenSanctions offers:
- **Free Tier**: 1,000 API calls/month
- **Basic**: $99/month for 10,000 calls
- **Professional**: $499/month for 100,000 calls
- **Enterprise**: Custom pricing

## Caching Strategy

To minimize API calls:
1. Cache positive matches for 7 days
2. Cache negative results for 24 hours
3. Store results in your MySQL database
4. Implement Redis for faster caching (optional)