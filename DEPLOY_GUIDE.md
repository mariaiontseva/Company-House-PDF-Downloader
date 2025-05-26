# Deployment Guide

## Option 1: GitHub Pages (Current - Limited)
The current deployment on GitHub Pages has limitations due to CORS restrictions. It can only generate Python scripts that users must run locally.

## Option 2: Netlify Deployment (Recommended - Full Features)

Netlify provides free hosting with serverless functions that can bypass CORS restrictions.

### Steps to Deploy on Netlify:

1. **Fork this repository** to your GitHub account

2. **Sign up for Netlify** (free)
   - Go to [netlify.com](https://netlify.com)
   - Sign up with your GitHub account

3. **Import your project**
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub
   - Select your forked repository

4. **Deploy**
   - Netlify will automatically deploy your site
   - You'll get a URL like `https://amazing-site-123.netlify.app`

5. **The serverless function will handle API calls**
   - No CORS issues
   - Direct download in browser
   - Full ZIP functionality

### Environment Variables (Optional)
If you want to hide the API key, add it as an environment variable in Netlify:
1. Go to Site settings → Environment variables
2. Add: `COMPANIES_HOUSE_API_KEY` = `your-api-key`

## Option 3: Manual URL Download (Works Now)

The current deployment includes a "Manual URLs" tab where users can:
1. Copy PDF URLs from Companies House website
2. Paste them into the tool
3. Download all as a ZIP file

This works because it downloads directly from the Companies House website (not the API), which doesn't have CORS restrictions.