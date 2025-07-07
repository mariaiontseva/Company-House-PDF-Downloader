# Company Investigation Report
## Company: JUST CASH FLOW PLC (08508165)
Generated: 2025-07-06T23:55:37.085Z

## Company Profile
- **Status**: administration
- **Type**: plc
- **Incorporation Date**: 2013-04-29
- **SIC Codes**: 64921

## Filing History
- **Total Accounts Filings**: 13
- **Items Analyzed**: 13

## Document Format Analysis
- **Total Documents**: 13
- **Available Formats**: application/pdf
- **PDF Documents**: 13
- **iXBRL Documents**: 0
- **XML Documents**: 0

### Recommendations
- PDF documents are available and can be used for fallback parsing when iXBRL is not available
- More PDF documents than iXBRL - PDF parsing capability is essential

## PDF Access Test Results
### Document 1 - 2022-09-21
- **Size**: 1041075 bytes
- **Access Tests**:
  - ❌ Direct API access: Request failed with status code 404
  - ❌ Content endpoint: Request failed with status code 404
  - ❌ With PDF format: Request failed with status code 404

### Document 2 - 2022-02-09
- **Size**: 80130 bytes
- **Access Tests**:
  - ❌ Direct API access: Request failed with status code 404
  - ❌ Content endpoint: Request failed with status code 404
  - ❌ With PDF format: Request failed with status code 404

### Document 3 - 2021-11-30
- **Size**: 80416 bytes
- **Access Tests**:
  - ❌ Direct API access: Request failed with status code 404
  - ❌ Content endpoint: Request failed with status code 404
  - ❌ With PDF format: Request failed with status code 404

## Key Insights for PDF Parsing

### PDF Document Characteristics
- **Average Size**: 606780 bytes
- **Size Range**: 17849 - 1351731 bytes

### PDF Access Methods
- Direct API access via document URL
- Content endpoint (`/content` suffix)
- Format parameter (`?format=pdf`)

### Challenges for PDF Parsing
- PDFs may contain scanned images rather than text
- Financial data may be in table format requiring table detection
- Text extraction may require OCR for image-based PDFs
- Data positioning and context recognition needed

### Recommended Approach
1. **Primary**: Use iXBRL when available (structured data)
2. **Fallback**: Extract text from PDF using PDF parsing libraries
3. **OCR**: Use OCR for image-based PDFs as last resort
4. **Pattern Matching**: Implement robust financial data pattern recognition
5. **Table Extraction**: Detect and extract tabular financial data