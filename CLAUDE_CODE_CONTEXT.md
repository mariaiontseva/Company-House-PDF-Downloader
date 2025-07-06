# Claude Code Quick Context

## 🚀 INSTANT PROJECT SETUP

**Copy-paste this for Claude Code context:**

```
This is a UK Companies House data exploration platform with 5.6M companies in Railway MySQL database. Users can filter by industry and download PDFs for £5.

KEY FILES:
- Main website: /Users/mariaiontseva/companies-house-downloader/index.html (3979+ lines)
- Production API: /Users/mariaiontseva/Desktop/companies-api/server.js
- Local API dev: /Users/mariaiontseva/companies-house-downloader/index.js

PRODUCTION SETUP:
- Frontend: Deploy from PDF branch to production
- API: Railway auto-deploys from companies-api/master branch
- Database: Railway MySQL with 5.6M UK companies
- API URL: https://companies-api-production-68c2.up.railway.app

CURRENT STATUS: Fully functional with industry filtering, pagination, PDF downloads
RECENT WORK: Fixed MEDIA industry filter, set FINANCIAL as default view
COMMON ISSUES: Industry filter patterns, Railway deployment delays, SIC code overlaps
```

## 📋 FAST COMMANDS

### Quick Deploy
```bash
# Frontend (PDF branch is production)
cd /Users/mariaiontseva/companies-house-downloader
git add . && git commit -m "Update" && git push origin PDF

# API (auto-deploys to Railway)
cd /Users/mariaiontseva/Desktop/companies-api  
git add . && git commit -m "Update" && git push
```

### Quick Test
```bash
# Test industry filtering
curl "https://companies-api-production-68c2.up.railway.app/api/oldest?industry=FINANCIAL"

# Test pagination
curl "https://companies-api-production-68c2.up.railway.app/api/oldest/10?industry=TECHNOLOGY"
```

### Quick Debug
```bash
# Check API status
curl "https://companies-api-production-68c2.up.railway.app/api/stats"

# Check branch
git branch  # Should be PDF for frontend work
```

## 🎯 COMMON TASKS

1. **Fix Industry Filter**: Edit SIC patterns in `/Users/mariaiontseva/Desktop/companies-api/server.js`
2. **Update UI**: Edit `/Users/mariaiontseva/companies-house-downloader/index.html`
3. **Test Changes**: Use curl commands above + open index.html in browser
4. **Deploy**: Push to PDF branch (frontend) or master (API)

## ⚡ EMERGENCY INFO

- **Production Branch**: PDF (not main!)
- **API Repository**: Separate repo at `/Users/mariaiontseva/Desktop/companies-api/`
- **Railway Dashboard**: Check for deployment status
- **Database**: 5.6M companies, hosted on Railway MySQL

Read full docs in PROJECT_DOCUMENTATION.md for complete details.