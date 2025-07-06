# DocSpace Article Templates

This directory contains reusable templates for generating static pages with consistent styling and structure based on the "Britain's Corporate Time Travelers" page design.

## Templates Available

### 1. `template-article.html` - General Article Template
A flexible template for creating article-style pages with:
- Hero section with title, subtitle, and description
- Optional feature image
- Optional highlight box (like the PLC Plot Twist)
- Main content area with paragraphs and pull quotes
- Optional conclusion section
- Consistent top bar and footer

### 2. `template-company-list.html` - Company List Template
Specialized template for pages featuring lists of companies with:
- Hero section
- Company cards with rank, badges, story, and fun facts
- Consistent styling with the original page

## How to Use

### Method 1: Using the JavaScript Generator

1. Create a JSON configuration file:
```json
{
    "PAGE_TITLE": "Your Page Title",
    "META_TITLE": "SEO Meta Title",
    "META_DESCRIPTION": "SEO meta description",
    "META_KEYWORDS": "keyword1, keyword2, keyword3",
    "PAGE_SLUG": "page-name.html",
    
    "HERO_TITLE": "Main Hero Title",
    "HERO_SUBTITLE": "Subtitle text",
    "HERO_DESCRIPTION": "Longer description paragraph",
    
    "FEATURE_IMAGE": true,
    "FEATURE_IMAGE_URL": "image.png",
    "FEATURE_IMAGE_ALT": "Image description",
    
    "HIGHLIGHT_BOX": true,
    "HIGHLIGHT_TITLE": "Highlight Box Title",
    "HIGHLIGHT_CONTENT": "Content with <strong>HTML</strong> support",
    
    "SECTION_TITLE": "Main Section Title",
    "CONTENT_PARAGRAPHS": [
        "First paragraph of content.",
        "Second paragraph of content."
    ],
    "PULL_QUOTE": "An interesting quote or fact",
    
    "CONCLUSION": true,
    "CONCLUSION_TITLE": "Conclusion Title",
    "CONCLUSION_PARAGRAPHS": [
        "First conclusion paragraph.",
        "Second conclusion paragraph with <strong>emphasis</strong>."
    ]
}
```

2. Generate the HTML:
```bash
node generate-article.js your-config.json output.html
```

### Method 2: Manual Replacement

1. Copy the template file
2. Replace placeholders manually:
   - `{{PAGE_TITLE}}` - Page title for browser tab
   - `{{META_TITLE}}` - SEO meta title
   - `{{META_DESCRIPTION}}` - SEO meta description
   - `{{HERO_TITLE}}` - Main hero section title
   - etc.

3. For optional sections:
   - Remove the entire section between `{{#if SECTION_NAME}}` and `{{/if}}` if not needed
   - Or set the value to `true` and fill in the content

## Template Variables Reference

### Common Variables (All Templates)
- `PAGE_TITLE` - Browser tab title
- `META_TITLE` - SEO meta title
- `META_DESCRIPTION` - SEO meta description  
- `META_KEYWORDS` - SEO keywords
- `PAGE_SLUG` - URL path (e.g., "about.html")
- `HERO_TITLE` - Main page title
- `HERO_SUBTITLE` - Subtitle below main title
- `HERO_DESCRIPTION` - Hero section paragraph

### Article Template Specific
- `FEATURE_IMAGE` - Boolean to show/hide feature image
- `FEATURE_IMAGE_URL` - Path to image
- `FEATURE_IMAGE_ALT` - Alt text for image
- `HIGHLIGHT_BOX` - Boolean to show/hide highlight box
- `HIGHLIGHT_TITLE` - Highlight box title
- `HIGHLIGHT_CONTENT` - Highlight box content (HTML supported)
- `SECTION_TITLE` - Optional main content section title
- `CONTENT_PARAGRAPHS` - Array of content paragraphs
- `PULL_QUOTE` - Optional pull quote/fun fact
- `CONCLUSION` - Boolean to show/hide conclusion
- `CONCLUSION_TITLE` - Conclusion section title
- `CONCLUSION_PARAGRAPHS` - Array of conclusion paragraphs

### Company List Template Specific
- `SECTION_TITLE` - Title above company list
- `COMPANIES` - Array of company objects with:
  - `rank` - Number ranking
  - `name` - Company name
  - `plc_badge` - PLC status text
  - `founded_badge` - Founded date text
  - `docs_badge` - Document count text
  - `company_id` - Companies House ID
  - `story_paragraphs` - Array of story paragraphs
  - `fun_fact` - Fun fact text

## Examples

### Creating a New Article Page
```bash
# Generate example to see the structure
node generate-article.js

# Create your config
cp example-article-config.json my-article-config.json
# Edit my-article-config.json with your content

# Generate the page
node generate-article.js my-article-config.json my-article.html
```

### Creating a Company List Page
1. Copy `template-company-list.html`
2. Replace variables with your content
3. Add company data in the COMPANIES array section

## Styling Notes

All templates include:
- Dark theme with purple gradient background
- Glassmorphism effects on components
- Responsive design (mobile, tablet, desktop)
- Professional typography with Inter font
- Consistent spacing and animations
- Same top bar and footer as main site

To customize colors or styling, modify the CSS variables in the `:root` section.

## Best Practices

1. Always include proper SEO metadata
2. Keep hero descriptions concise but informative
3. Use semantic HTML in content (strong, em, etc.)
4. Optimize images before including them
5. Test responsive design on multiple devices
6. Maintain consistent tone and style with existing pages