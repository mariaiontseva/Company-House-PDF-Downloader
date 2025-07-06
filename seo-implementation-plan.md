# DocSpace.uk SEO Implementation Plan

## Phase 1: URL Structure & Server-Side Routing

### 1.1 Apache/Nginx Rewrite Rules
```apache
# .htaccess for Apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^company/([a-zA-Z0-9]+)/?$ /index.html [L,QSA]

# Add company parameter to query string
RewriteCond %{REQUEST_URI} ^/company/([a-zA-Z0-9]+)
RewriteRule ^company/([a-zA-Z0-9]+)/?$ /index.html?company=%1 [L,QSA]
```

### 1.2 Dynamic Meta Tags
```html
<!-- Dynamic meta tags based on company data -->
<meta property="og:title" content="TESCO PLC (00445790) - Complete Company Documents | DocSpace">
<meta property="og:description" content="Download all TESCO PLC documents from Companies House. 106 years in business, active status, complete filing history available for £5.">
<meta property="og:url" content="https://docspace.uk/company/00445790">
<meta property="og:image" content="https://docspace.uk/og-images/company-00445790.png">

<meta name="description" content="TESCO PLC company information: incorporation date, directors, charges, filing history. Download complete Companies House documents instantly.">
<meta name="keywords" content="TESCO PLC, company documents, Companies House, 00445790, UK company filings">

<!-- JSON-LD Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TESCO PLC",
  "identifier": "00445790",
  "foundingDate": "1918-11-27",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "GB"
  },
  "url": "https://docspace.uk/company/00445790"
}
</script>
```

## Phase 2: Content Strategy & Landing Pages

### 2.1 Industry-Specific Landing Pages
```
/industries/retail-companies
/industries/financial-services
/industries/technology-companies
/oldest-companies-uk
/newest-companies-uk
/royal-charter-companies
```

### 2.2 Location-Based Pages
```
/companies/london
/companies/manchester
/companies/birmingham
/scotland-companies
/wales-companies
```

### 2.3 Company Size Categories
```
/plc-companies
/limited-companies
/small-businesses
/large-corporations
/ftse-100-companies
```

## Phase 3: Technical SEO Improvements

### 3.1 Page Speed Optimization
- Implement lazy loading for company data
- Compress images and assets
- Use CDN for static assets
- Minimize JavaScript bundles

### 3.2 Core Web Vitals
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1

### 3.3 Mobile Optimization
- Responsive design (already implemented)
- Mobile-first indexing ready
- Touch-friendly interface

## Phase 4: Content Marketing & Link Building

### 4.1 Blog Content Strategy
```
/blog/how-to-download-companies-house-documents
/blog/understanding-uk-company-structures
/blog/royal-charter-companies-guide
/blog/companies-house-filing-requirements
/blog/uk-business-registration-process
```

### 4.2 Resource Pages
```
/resources/company-search-guide
/resources/director-information-lookup
/resources/charges-and-mortgages-explained
/resources/sic-codes-directory
```

## Phase 5: Local SEO & Citations

### 5.1 Google Business Profile
- Create GMB listing for DocSpace
- Add business information
- Collect customer reviews

### 5.2 Local Directory Listings
- UK business directories
- Legal services directories
- Technology directories

## Phase 6: Monitoring & Analytics

### 6.1 SEO Tools Setup
- Google Search Console
- Google Analytics 4
- Schema markup validation
- Page speed monitoring

### 6.2 KPI Tracking
- Organic traffic growth
- Keyword rankings
- Company page indexation
- Conversion rates