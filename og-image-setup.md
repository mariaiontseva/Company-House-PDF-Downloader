# Setting Up Your Social Media Preview Image

## Step 1: Save the Image
1. Save the provided image as `og-image.png` in your repository root
2. The image should be 1200x630 pixels (standard Open Graph size)
3. Optimize the file size (aim for under 300KB for faster loading)

## Step 2: Upload to Your Server
Upload `og-image.png` to the root of your docspace.uk domain so it's accessible at:
https://docspace.uk/og-image.png

## Step 3: Verify Meta Tags (Already Set Up)
Your index.html already has the correct meta tags:

```html
<!-- Open Graph -->
<meta property="og:image" content="https://docspace.uk/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="DocSpace - AI Business Intelligence on 5.5 Million UK Companies">
<meta property="og:image:type" content="image/png">
<meta property="og:image:secure_url" content="https://docspace.uk/og-image.png">

<!-- Twitter Card -->
<meta property="twitter:image" content="https://docspace.uk/og-image.png">
<meta property="twitter:image:alt" content="DocSpace - AI-powered UK company intelligence platform">
```

## Step 4: Test Your Social Sharing

After uploading the image:

1. **Facebook Debugger**: 
   https://developers.facebook.com/tools/debug/?q=https://docspace.uk
   - Click "Scrape Again" to refresh the cache

2. **Twitter Card Validator**:
   https://cards-dev.twitter.com/validator
   - Enter https://docspace.uk and validate

3. **LinkedIn Post Inspector**:
   https://www.linkedin.com/post-inspector/
   - Enter https://docspace.uk and inspect

4. **WhatsApp Test**:
   - Send the link to yourself in WhatsApp
   - You should see the new preview image

## Step 5: Clear Social Media Cache

If the old preview persists:
- Facebook: Use the debugger and click "Scrape Again"
- Twitter: Wait 7 days or tweet with a URL parameter like ?v=2
- LinkedIn: Use Post Inspector to refresh
- WhatsApp: Add a parameter like ?refresh=1 to the URL

## Image Requirements Met:
- ✅ Professional dark theme matching your brand
- ✅ Search interface prominently displayed
- ✅ DocSpace branding at the bottom
- ✅ Modern network/data visualization elements
- ✅ Clean, minimalist design
- ✅ High contrast for visibility on all platforms

The image will appear when sharing on:
- WhatsApp
- Facebook
- Twitter
- LinkedIn
- Slack
- Discord
- iMessage
- And other platforms that support Open Graph