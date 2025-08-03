# OpenSanctions API Complete Guide

## Overview
OpenSanctions provides a comprehensive global database of:
- Sanctioned entities
- Politically exposed persons (PEPs)
- Criminal watchlists
- Entities of interest

## Entity Types

### 1. **Person** (Individuals)
- Politicians, businesspeople, criminals
- Properties: birthDate, nationality, position, aliases
- Example: Vladimir Putin, Roman Abramovich

### 2. **Company** (Commercial entities)
- Banks, corporations, businesses
- Properties: registrationNumber, incorporationDate, country
- Example: Sberbank, Rosneft

### 3. **Organization** (Non-commercial entities)
- Military groups, NGOs, government bodies
- Example: Wagner Group, Hezbollah

### 4. **Vessel** (Ships)
- Properties: imoNumber, flag, previousNames
- Example: NS Champion (IMO9299719)

### 5. **Airplane** (Aircraft)
- Properties: registrationNumber, model

### 6. **LegalEntity** (Generic)
- Covers any person, company, or organization

### 7. **Thing** (Most generic)
- Catch-all for any entity type

## API Usage Examples

### Search for a Person
```javascript
{
  "queries": {
    "q1": {
      "schema": "Person",
      "properties": {
        "name": ["Vladimir Putin"]
      }
    }
  }
}
```

### Search for a Company
```javascript
{
  "queries": {
    "q1": {
      "schema": "Company",
      "properties": {
        "name": ["Sberbank"]
      }
    }
  }
}
```

### Search Any Entity Type
```javascript
{
  "queries": {
    "q1": {
      "schema": "LegalEntity",
      "properties": {
        "name": ["Wagner"]
      }
    }
  }
}
```

## Sanctions Lists Included

### US Sanctions
- `us_ofac_sdn` - OFAC SDN List
- `us_ofac_cons` - OFAC Consolidated List
- `us_trade_csl` - Trade Consolidated Screening List

### UK Sanctions
- `gb_hmt_sanctions` - HM Treasury Sanctions
- `gb_fcdo_sanctions` - Foreign Office Sanctions

### EU Sanctions
- `eu_fsf` - EU Financial Sanctions
- `eu_eeas_sanctions` - EU External Action Service

### Other Countries
- `ch_seco_sanctions` - Swiss Sanctions
- `au_dfat_sanctions` - Australian Sanctions
- `ca_dfatd_sema_sanctions` - Canadian Sanctions
- `jp_mof_sanctions` - Japanese Sanctions

## Match Scores
- **1.0** - Exact match
- **0.9+** - Very high confidence
- **0.8-0.9** - High confidence
- **0.7-0.8** - Medium confidence
- **<0.7** - Low confidence (typically ignored)

## Use Cases

### 1. KYC/AML Compliance
- Check customers against sanctions lists
- Identify politically exposed persons
- Screen for criminal associations

### 2. Supply Chain Due Diligence
- Verify business partners
- Check vessel ownership
- Screen logistics providers

### 3. Investment Screening
- Check portfolio companies
- Verify beneficial ownership
- Screen board members

### 4. Media/Journalism
- Research sanctioned entities
- Track oligarch networks
- Investigate shell companies

## Current Implementation

Our proxy server at `/api/sanctions/check/:name`:
1. Accepts any entity name
2. Searches using `LegalEntity` schema (covers all types)
3. Returns sanctions status if match score > 0.7
4. Filters to only show entities on actual sanctions lists
5. Provides match score and sanctions lists

## API Limits
- Free tier: 1,000 calls/month
- Paid plans available for higher volume
- Responses cached for efficiency