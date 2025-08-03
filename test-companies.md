# Sanctioned Companies Test List

Once the real OpenSanctions API is working (showing `"source": "opensanctions"`), these companies should show as sanctioned:

## Russian Banks & Financial Institutions
1. **Sberbank** - Russia's largest bank
2. **VTB Bank** - Second largest Russian bank  
3. **Gazprombank** - Third largest Russian bank
4. **Alfa Bank** - Major private Russian bank
5. **Bank Otkritie** - Russian bank
6. **Sovcombank** - Russian commercial bank
7. **VEB.RF** - Russian state development bank

## Russian Energy Companies
8. **Gazprom** - Russian gas giant
9. **Rosneft** - Russian oil company
10. **Lukoil** - Russian oil company

## Military/Defense
11. **Wagner Group** - Russian private military company

## Test URLs
```bash
# Test if API is using real data
curl -s "https://company-house-pdf-downloader-production-1eb5.up.railway.app/api/sanctions/check/Wagner%20Group" | jq '.data.source'

# Should return "opensanctions" not "simulated"
```

## How to verify on docspace.uk
1. Go to https://docspace.uk
2. Search for any of the companies above
3. You should see a red sanctions badge
4. The badge should also appear in the search suggestions

## UK Companies Under Sanctions
For UK-registered companies that are sanctioned:
- **Sberbank CIB (UK) Limited** (04783112) - Already confirmed sanctioned