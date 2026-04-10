# Image Compression Needed for WhatsApp/Telegram

The current og-image-v2.png is 1.4MB, which is too large for WhatsApp and Telegram.

## Requirements:
- WhatsApp: Prefers images under 300KB
- Telegram: Prefers images under 5MB but works better with smaller files
- Ideal dimensions: 1200x630 (standard Open Graph size)

## Options to compress:

### Option 1: Use an online compressor
1. Go to: https://tinypng.com or https://squoosh.app
2. Upload og-image-v2.png
3. Compress to under 300KB
4. Save as og-image-v2.png (replace the existing one)

### Option 2: Use ImageMagick (if installed)
```bash
convert og-image-v2.png -quality 85 -resize 1200x630 og-image-compressed.png
```

### Option 3: Use Preview on Mac
1. Open og-image-v2.png in Preview
2. Tools → Adjust Size → Set to 1200x630
3. File → Export → Reduce file size

## After compressing:
1. Replace the current og-image-v2.png with the compressed version
2. Git add, commit, and push
3. Test on WhatsApp again

The image needs to be:
- Under 300KB for WhatsApp
- 1200x630 pixels (or 1200x1200 square)
- PNG or JPG format