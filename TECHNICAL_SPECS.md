# Technical Specifications

## 🗄️ Database Configuration

### Railway MySQL Database
```
Host: turntable.proxy.rlwy.net
Port: 51124
User: root
Password: FuEbybhbhPwJXtsPAqdKdXyvbyOCxVWc
Database: railway
```

### Companies Table Schema
```sql
CREATE TABLE companies (
    CompanyName VARCHAR(255),
    CompanyNumber VARCHAR(20) PRIMARY KEY,
    CompanyStatus VARCHAR(50),
    IncorporationDate DATETIME,
    RegAddress_PostTown VARCHAR(100),
    RegAddress_County VARCHAR(100), 
    RegAddress_Country VARCHAR(100),
    SICCode_SicText_1 TEXT,
    SICCode_SicText_2 TEXT,
    SICCode_SicText_3 TEXT,
    SICCode_SicText_4 TEXT
    -- Additional fields exist
);
```

**Records**: 5,642,309 total companies
**Active**: 5,122,606 companies
**Dissolved**: 519,703 companies

## 🔌 API Specifications

### Railway API Service
- **Platform**: Railway.app
- **Runtime**: Node.js with Express
- **Auto-Deploy**: From `companies-api/master` branch
- **URL**: `https://companies-api-production-68c2.up.railway.app`

### API Dependencies
```json
{
  "express": "^4.18.2",
  "mysql2": "^3.6.0", 
  "cors": "^2.8.5"
}
```

### Rate Limits
- No explicit rate limiting implemented
- Railway infrastructure limits apply
- Database connection pooling: Single connection

### Response Format
```json
{
  "CompanyName": "string",
  "CompanyNumber": "string", 
  "CompanyStatus": "Active|Dissolved",
  "IncorporationDate": "ISO 8601 datetime",
  "RegAddress_PostTown": "string",
  "RegAddress_County": "string|null",
  "RegAddress_Country": "string",
  "SICCode_SicText_1": "string",
  "SICCode_SicText_2": "string|null",
  "SICCode_SicText_3": "string|null", 
  "SICCode_SicText_4": "string|null"
}
```

## 🎨 Frontend Specifications

### Technology Stack
- **HTML5** with semantic markup
- **Vanilla JavaScript** (no frameworks)
- **CSS3** with custom properties and gradients
- **Responsive design** with mobile-first approach

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Metrics
- **Initial Load**: ~2-3 seconds
- **API Response**: ~200-500ms
- **Pagination**: ~300-600ms
- **Bundle Size**: Single HTML file (~150KB)

### Dependencies
- **Google Analytics**: gtag.js
- **No CSS frameworks** (custom CSS)
- **No JavaScript libraries** (vanilla JS)

## 🏗️ Infrastructure

### Railway Configuration
```yaml
# Inferred from deployment
runtime: nodejs
buildCommand: npm install
startCommand: node server.js
port: ${PORT} # Railway auto-assigns
```

### GitHub Integration
- **Main Repo**: `mariaiontseva/Company-House-PDF-Downloader`
- **API Repo**: `mariaiontseva/companies-api`
- **Auto-deploy**: Enabled for Railway from API repo

### Domain & SSL
- **Custom domain**: Configured via GitHub Pages or similar
- **SSL**: Automatic via Railway/GitHub Pages
- **CDN**: Built-in via hosting platform

## 💳 Payment Integration

### Stripe Configuration
```javascript
// Stripe integration for £5 PDF downloads
// Configuration in frontend JavaScript
// Test/Live keys environment-dependent
```

### Pricing Model
- **Per-company fee**: £5.00 GBP
- **Payment method**: Stripe Checkout
- **Currency**: GBP (British Pounds)
- **Tax**: Included in price

## 📊 Analytics & Monitoring

### Google Analytics 4
```javascript
// GA4 Configuration
gtag('config', 'G-RR9SEE0SQF', {
  // Standard e-commerce tracking
  // Custom events for industry filtering
  // PDF download conversion tracking
});
```

### Error Tracking
- **Client-side**: Console logging + browser dev tools
- **Server-side**: Railway deployment logs
- **Database**: MySQL error logs via Railway dashboard

### Performance Monitoring
- **Core Web Vitals**: Tracked via GA4
- **API Response Times**: Logged to console
- **Database Query Performance**: Railway metrics

## 🔐 Security Configuration

### API Security
- **CORS**: Enabled for cross-origin requests
- **SQL Injection**: Prevented via parameterized queries
- **Rate Limiting**: Relies on Railway infrastructure
- **Authentication**: None required (public API)

### Frontend Security
- **XSS Prevention**: Input sanitization
- **HTTPS**: Enforced via hosting platform
- **Content Security Policy**: Browser defaults
- **Data Privacy**: GDPR-compliant (public company data)

### Database Security
- **Connection**: SSL-encrypted via Railway
- **Access Control**: IP-based restrictions via Railway
- **Backup**: Managed by Railway
- **Monitoring**: Railway dashboard alerts

## 🚀 Deployment Pipeline

### Frontend Deployment
```bash
# Production deployment
git checkout PDF
git add .
git commit -m "Deploy changes"
git push origin PDF
# Auto-deploys to production hosting
```

### API Deployment
```bash
# Railway auto-deployment
git checkout master
git add .
git commit -m "API updates"
git push origin master
# Railway auto-deploys within 1-2 minutes
```

### Environment Variables
```bash
# Railway API Environment
PORT=3000  # Auto-assigned by Railway
NODE_ENV=production  # Set by Railway

# Database connection hardcoded in server.js
# (Should be moved to environment variables)
```

## 📈 Scalability Considerations

### Current Limitations
- **Single database connection**: No connection pooling
- **No caching**: Every request hits database
- **No CDN**: Static assets served directly
- **No load balancing**: Single Railway instance

### Scaling Opportunities
1. **Database optimization**: Add indexes, connection pooling
2. **Caching layer**: Redis for frequent queries
3. **CDN integration**: CloudFlare for static assets
4. **API rate limiting**: Prevent abuse
5. **Horizontal scaling**: Multiple Railway instances

### Performance Optimizations
- **Database indexes**: On SICCode_SicText_1, CompanyStatus, IncorporationDate
- **Query optimization**: Limit result sets, optimize WHERE clauses
- **Frontend caching**: Browser caching for static assets
- **Lazy loading**: Pagination instead of large result sets

## 🔧 Development Environment

### Local Development Setup
```bash
# API Development
cd /Users/mariaiontseva/Desktop/companies-api
npm install
node server.js  # Runs on localhost:3000

# Frontend Development  
cd /Users/mariaiontseva/companies-house-downloader
open index.html  # Open in browser for testing
```

### Required Tools
- **Node.js 18+**: For API development
- **Git**: For version control
- **Modern browser**: For frontend testing
- **curl**: For API testing
- **Text editor**: VS Code recommended

### Testing Strategy
- **Manual testing**: Browser-based for frontend
- **API testing**: curl commands
- **No automated tests**: Currently manual QA only
- **Error monitoring**: Console logging

**Last Updated**: December 2024