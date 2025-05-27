# URGENT: GitHub Pages Deployment Issue

The website is still serving old code with broken PDF downloads.

## Problem
Live website has this broken code:
```javascript
const pdfUrl = doc.metadataUrl.includes('document-api.') 
    ? doc.metadataUrl          // ← WRONG! Returns metadata (597 bytes)
    : `${doc.metadataUrl}/content`;
```

## Solution Required
The code should be:
```javascript
const contentUrl = `${doc.metadataUrl}/content`;
```

## Manual Fix Required
Since GitHub Pages isn't updating, we need to manually fix the deployed version.

Time: $(date)