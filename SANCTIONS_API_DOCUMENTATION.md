# Sanctions API Documentation

## Overview

The sanctions checking feature integrates with the OpenSanctions API to identify companies and individuals that are under international sanctions. This helps users assess risk and comply with due diligence requirements.

## Current Implementation

### API Endpoints

1. **Check Individual Entity**
   ```
   GET /api/sanctions/check/:name
   ```
   - Checks if a specific company or person is sanctioned
   - Returns sanctions status, lists, and last update time

2. **Get Sanctions Count**
   ```
   GET /api/sanctions/count
   ```
   - Returns total count of sanctioned UK companies
   - Used for the homepage counter display

### How It Works

1. **Frontend Integration**
   - When a company page loads, the frontend makes an API call to check sanctions
   - If sanctioned, a red badge appears next to the company status
   - Risk score is automatically reduced by 50 points for sanctioned entities

2. **Proxy Server**
   - All sanctions checks go through our proxy server
   - Currently using simulated data (test entities)
   - Ready for OpenSanctions API integration

3. **Response Format**
   ```json
   {
     "status": "success",
     "data": {
       "entity": "VTB Bank Europe Limited",
       "sanctioned": true,
       "lists": ["EU Sanctions", "UK Sanctions", "US OFAC"],
       "lastUpdated": "2024-08-03T10:00:00Z",
       "source": "opensanctions"
     }
   }
   ```

## OpenSanctions API Capabilities

### Current Features We Use
- **Entity matching** - Check if a company/person is sanctioned
- **Sanctions lists** - Which sanctions programs list the entity
- **Last updated** - When the data was last refreshed

### Additional Data Available from OpenSanctions

1. **Detailed Entity Information**
   - Full legal names and aliases
   - Date of birth (for individuals)
   - Countries of citizenship/registration
   - Official identification numbers (passport, tax ID, etc.)

2. **Sanctions Details**
   - Specific sanctions programs and their dates
   - Reasons for sanctions
   - Legal basis and references
   - Sanction types (asset freeze, travel ban, etc.)

3. **Related Entities**
   - Parent/subsidiary companies
   - Associated individuals (directors, beneficial owners)
   - Business relationships and networks
   - Ownership structures

4. **Risk Indicators**
   - PEP (Politically Exposed Person) status
   - Criminal allegations or convictions
   - Regulatory actions
   - Adverse media mentions

5. **Geographic Data**
   - Addresses and locations
   - Countries of operation
   - Jurisdictions involved

6. **Historical Data**
   - Previous sanctions (now lifted)
   - Changes in sanctions status
   - Timeline of designations

7. **Additional Watchlists**
   - Interpol Red Notices
   - FBI Most Wanted
   - DEA Fugitives
   - Financial crime databases

## Implementation Steps for Full Integration

### 1. Get OpenSanctions API Key
```bash
# Sign up at https://www.opensanctions.org/api/
# Add to environment variables:
OPENSANCTIONS_API_KEY=your_api_key_here
```

### 2. Update Proxy Server
```javascript
// Replace simulated check with real API call
app.get('/api/sanctions/check/:name', async (req, res) => {
    const { name } = req.params;
    
    try {
        const response = await fetch(`https://api.opensanctions.org/match/default`, {
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
        
        const data = await response.json();
        // Process and return results
    } catch (error) {
        console.error('OpenSanctions API error:', error);
    }
});
```

### 3. Enhanced Features We Could Add

1. **Detailed Sanctions View**
   - Show full sanctions details in a modal
   - Display timeline of sanctions
   - List all associated entities

2. **Bulk Checking**
   - Check multiple companies at once
   - Export sanctions report for portfolios

3. **Real-time Monitoring**
   - Set up alerts for sanctions changes
   - Track when entities are added/removed from lists

4. **Network Analysis**
   - Visualize connections between sanctioned entities
   - Show ownership chains and relationships

5. **Compliance Reports**
   - Generate PDF reports for due diligence
   - Audit trail of checks performed
   - Compliance certificates

## Security Considerations

1. **API Key Protection**
   - Never expose API key in frontend code
   - Use environment variables
   - Implement rate limiting

2. **Data Caching**
   - Cache results for 24 hours to reduce API calls
   - Implement cache invalidation for updates

3. **Access Control**
   - Log all sanctions checks for audit purposes
   - Implement user authentication for sensitive features

## Cost Optimization

1. **Caching Strategy**
   - Cache positive hits longer (7 days)
   - Cache negative results shorter (24 hours)
   - Use database to store check history

2. **Batch Processing**
   - Group multiple checks into single API calls
   - Process company lists during off-peak hours

## Testing

### Test Entities (Currently Configured)
- Vladimir Putin
- Roman Abramovich
- Gazprom
- Rosneft
- VTB Bank

### Test Commands
```bash
# Check if an entity is sanctioned
curl http://localhost:3002/api/sanctions/check/VTB%20Bank

# Get total sanctions count
curl http://localhost:3002/api/sanctions/count
```

## Future Enhancements

1. **Machine Learning Integration**
   - Fuzzy name matching for better accuracy
   - Predict sanctions risk based on patterns

2. **Blockchain Integration**
   - Immutable audit trail of checks
   - Decentralized sanctions registry

3. **AI-Powered Analysis**
   - Natural language processing of sanctions documents
   - Automatic risk assessment reports

## Resources

- [OpenSanctions Documentation](https://www.opensanctions.org/docs/)
- [OpenSanctions API Reference](https://www.opensanctions.org/api/)
- [Sanctions Datasets](https://www.opensanctions.org/datasets/)
- [UK Sanctions List](https://www.gov.uk/government/publications/financial-sanctions-consolidated-list-of-targets)