# Companies House Downloader - Project Documentation

## 🎯 Quick Claude Code Context

**What this project does**: UK Companies House data exploration platform with 5.6M companies in Railway MySQL database. Users can explore/filter companies and download PDFs for £5.

**Current Status**: Fully functional platform with industry filtering, pagination, and PDF download capabilities.

**Main Issue Areas**: Industry filtering, API deployment, UI/UX improvements.

---

## 📁 Project Structure

### Repositories
1. **Main Frontend Repository**: `https://github.com/mariaiontseva/Company-House-PDF-Downloader.git`
   - Location: `/Users/mariaiontseva/companies-house-downloader/`
   - Contains: Website frontend, local API development files
   - **Production Branch**: `PDF` (deploys to production)

2. **API Repository**: `https://github.com/mariaiontseva/companies-api.git`
   - Location: `/Users/mariaiontseva/Desktop/companies-api/`
   - Contains: Production API code
   - **Production Branch**: `master` (auto-deploys to Railway)

### Key Files
- `/Users/mariaiontseva/companies-house-downloader/index.html` - Main website (3979+ lines)
- `/Users/mariaiontseva/companies-house-downloader/index.js` - Local API development
- `/Users/mariaiontseva/Desktop/companies-api/server.js` - Production API deployed to Railway

---

## 🌿 Branch Strategy

### Main Repository Branches
- **`main`**: Original development branch
- **`PDF`**: 🚀 **PRODUCTION BRANCH** - Used for live website
- **`dev-frontend`**: Development branch for frontend changes

### Deployment Flow
```
Local Development → PDF Branch → Production Website
API Development → companies-api/master → Railway Auto-Deploy
```

**Important**: Always work on and deploy from the `PDF` branch for production changes.

---

## 🚀 Services & Infrastructure

### 1. Railway Platform
- **Database**: MySQL hosting for 5.6M UK companies data
- **API Hosting**: Node.js Express API
- **Connection**: 
  - Host: `turntable.proxy.rlwy.net`
  - Port: `51124`
  - Database: `railway`
- **API URL**: `https://companies-api-production-68c2.up.railway.app`

### 2. GitHub Pages / Static Hosting
- **Frontend**: Deployed from `PDF` branch
- **Domain**: Custom domain configured

### 3. Third-Party Services
- **Stripe**: Payment processing for £5 PDF downloads
- **Companies House API**: Official UK government API for company data
- **Google Analytics**: Tracking with ID `G-RR9SEE0SQF`

---

## 🔌 API Documentation

### Base URL
```
https://companies-api-production-68c2.up.railway.app
```

### Endpoints

#### 1. Get Oldest Companies
```
GET /api/oldest/:offset?industry=INDUSTRY_CODE
```
- **Offset**: Pagination offset (optional, path parameter)
- **Industry**: Filter by industry (optional, query parameter)
- **Example**: `/api/oldest/10?industry=FINANCIAL`

#### 2. Get Newest Companies
```
GET /api/newest/:offset?industry=INDUSTRY_CODE
```
- Same parameters as oldest

#### 3. Search Companies
```
GET /api/search/:query
```
- **Query**: Company name or number to search

#### 4. Get Statistics
```
GET /api/stats
```
- Returns total, active, and dissolved company counts

### Industry Filter Codes
- `ALL`: All industries
- `FINANCIAL`: Banks, insurance, financial services (64%, 65%, 66%)
- `TECHNOLOGY`: Software, IT, computing (62%, 63%)
- `MANUFACTURING`: Production, factories (10%-33%)
- `RETAIL`: Sales, wholesale (45%-47%)
- `REAL_ESTATE`: Property, real estate (68%)
- `ENERGY`: Oil, gas, electric, mining (05%-09%, 35%)
- `HEALTHCARE`: Medical, hospitals (86%-88%)
- `TRANSPORT`: Logistics, shipping (49%-53%)
- `CONSTRUCTION`: Building, construction (41%-43%)
- `SERVICES`: Consulting, legal, professional (69%-75%)
- `MEDIA`: Publishing, broadcasting, film (58%-60%, 90%-91%)
- `AGRICULTURE`: Farming, food production (01%-03%, 10%-11%)
- `OTHER`: Everything else

---

## 💾 Database Schema

### Companies Table
Key columns in the Railway MySQL database:
- `CompanyName`: Company name
- `CompanyNumber`: Unique company identifier
- `CompanyStatus`: Active/Dissolved
- `IncorporationDate`: Date company was incorporated
- `RegAddress_PostTown`: Registered address town
- `RegAddress_County`: Registered address county
- `RegAddress_Country`: Registered address country
- `SICCode_SicText_1`: Primary SIC code and description
- `SICCode_SicText_2`: Secondary SIC code
- `SICCode_SicText_3`: Tertiary SIC code
- `SICCode_SicText_4`: Quaternary SIC code

**Total Records**: 5.6M+ companies

---

## 🎨 Frontend Architecture

### Main Components
1. **Tab Navigation**: Explore vs Bulk PDF Download
2. **Industry Filter**: Dropdown with 13+ industry categories
3. **View Toggle**: Oldest vs Newest companies
4. **Pagination**: "Load More" functionality
5. **Company Cards**: Display company info with industry badges

### Key JavaScript Functions
- `loadRealCompanies()`: Loads data from Railway API
- `showOldest()` / `showNewest()`: Switches between views
- `onIndustryChange()`: Handles industry filter changes
- `renderCompanies()`: Updates UI with company data
- `loadMoreCompanies()`: Pagination handler

### Styling
- **Theme**: Dark theme with purple/blue gradients
- **Framework**: Vanilla CSS with custom components
- **Responsive**: Mobile-friendly design
- **Icons**: Emoji-based industry indicators

---

## 🔧 Common Development Tasks

### 1. Fix Industry Filtering
```bash
# Edit API patterns in:
/Users/mariaiontseva/Desktop/companies-api/server.js

# Update industry pattern arrays, then:
cd /Users/mariaiontseva/Desktop/companies-api
git add . && git commit -m "Fix industry patterns" && git push
# Railway auto-deploys
```

### 2. Update Frontend
```bash
# Edit main file:
/Users/mariaiontseva/companies-house-downloader/index.html

# Deploy to production:
cd /Users/mariaiontseva/companies-house-downloader
git add . && git commit -m "Update frontend" && git push origin PDF
```

### 3. Test API Changes
```bash
# Test specific industry:
curl "https://companies-api-production-68c2.up.railway.app/api/oldest?industry=FINANCIAL"

# Test pagination:
curl "https://companies-api-production-68c2.up.railway.app/api/oldest/10?industry=TECHNOLOGY"
```

### 4. Check Railway Deployment
- Visit Railway dashboard
- Check deployment logs
- API changes auto-deploy from `companies-api/master`

---

## 🚨 Known Issues & Solutions

### 1. Industry Filter Not Working
- **Cause**: API patterns too broad or overlapping
- **Fix**: Update SIC code patterns in `/Users/mariaiontseva/Desktop/companies-api/server.js`
- **Test**: Use curl to test API directly before frontend changes

### 2. Railway Deployment Delays
- **Cause**: Railway auto-deploy can take 1-2 minutes
- **Fix**: Wait longer, or trigger redeploy with small change + push

### 3. Frontend Not Updating
- **Cause**: Wrong branch or caching
- **Fix**: Ensure working on `PDF` branch, check browser cache

### 4. Mixed Industry Results
- **Cause**: SIC pattern overlaps (e.g., %PUBLISHING% matching financial companies)
- **Fix**: Use specific SIC ranges instead of keyword patterns

---

## 📋 Development Checklist

When making changes:

### Before Starting
- [ ] Confirm current branch: `git branch` (should be `PDF` for frontend)
- [ ] Pull latest: `git pull origin PDF`
- [ ] Check Railway API status with test curl

### API Changes
- [ ] Edit `/Users/mariaiontseva/Desktop/companies-api/server.js`
- [ ] Test locally if needed
- [ ] Commit and push to auto-deploy
- [ ] Wait 1-2 minutes for Railway deployment
- [ ] Test with curl commands

### Frontend Changes
- [ ] Edit `/Users/mariaiontseva/companies-house-downloader/index.html`
- [ ] Test locally by opening file in browser
- [ ] Commit and push to `PDF` branch
- [ ] Check production deployment

### Testing
- [ ] Test industry filtering with multiple categories
- [ ] Test pagination (Load More button)
- [ ] Test both Oldest and Newest views
- [ ] Test on mobile device
- [ ] Check console for JavaScript errors

---

## 📞 Emergency Recovery

### If API is completely broken:
1. Check Railway dashboard for deployment status
2. Revert last commit in `companies-api` repository
3. Force redeploy by making trivial change + push

### If Frontend is broken:
1. Check which branch is deployed (`PDF`)
2. Revert last commit on `PDF` branch
3. Push to restore previous working version

### If Database is inaccessible:
1. Check Railway dashboard for database status
2. Verify connection credentials in API code
3. Check Railway project billing/status

---

## 🎯 Performance Optimization

### Current Optimizations
- API pagination (5 results per page)
- Industry filtering at database level
- Lazy loading of images/content
- Minimal JavaScript libraries (vanilla JS)

### Future Improvements
- Add caching for frequently requested industries
- Implement search result caching
- Add loading states for better UX
- Consider CDN for static assets

---

## 📈 Analytics & Monitoring

### Google Analytics
- **Tracking ID**: `G-RR9SEE0SQF`
- **Events**: Page views, search queries, industry filter usage
- **Goals**: PDF download conversions

### Error Monitoring
- Console logging for API errors
- Client-side error tracking in browser console
- Railway deployment logs for API issues

---

**Last Updated**: December 2024
**Maintained By**: Maria Iontseva
**Claude Code Ready**: ✅ Use this document for instant project context