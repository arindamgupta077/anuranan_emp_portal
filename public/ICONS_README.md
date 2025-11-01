# PWA Icons

✅ **All icons have been created!**

The following icon files are now available in this folder:

## Required Icons

1. **favicon.ico** (16x16, 32x32, 48x48)
   - Place in: `public/favicon.ico`
   - Standard browser favicon

2. **icon-192x192.png**
   - Place in: `public/icon-192x192.png`
   - Size: 192x192 pixels
   - Used for: Android home screen, PWA install

3. **icon-512x512.png**
   - Place in: `public/icon-512x512.png`
   - Size: 512x512 pixels
   - Used for: High-res displays, splash screens

4. **apple-touch-icon.png** (optional but recommended)
   - Place in: `public/apple-touch-icon.png`
   - Size: 180x180 pixels
   - Used for: iOS home screen

## How to Create Icons

### Option 1: Using a Logo/Design

1. Create your logo in a square format (at least 512x512px)
2. Use an online tool like:
   - https://realfavicongenerator.net/
   - https://www.favicon-generator.org/
   - Canva (free)
3. Generate all required sizes
4. Download and place in `public/` folder

### Option 2: Simple Text Icon (Quick Start)

If you don't have a logo ready, create a simple text-based icon:

1. Go to https://www.favicon.cc/ or use any image editor
2. Create a square image with:
   - Background color: #dc2626 (red - your theme color)
   - Text: "A" (for Anuranan)
   - Text color: white
3. Export in required sizes

### Option 3: Use Placeholder

For development, you can use this simple approach:

1. Create a 512x512 PNG with red background and white "A" text
2. Resize it to create 192x192 version
3. Convert 192x192 to ICO format for favicon

## Quick Colors Reference

Based on your branding:
- **Primary Red**: #dc2626
- **White**: #ffffff
- **Dark Gray**: #1f2937

## After Creating Icons

1. Place all files in the `public/` folder
2. Verify filenames match exactly as specified above
3. Test PWA install on mobile device
4. Check appearance of icons on home screen

## Testing

- **Desktop**: Chrome > Install icon in address bar
- **Android**: Chrome > Menu > Add to Home Screen
- **iOS**: Safari > Share > Add to Home Screen

The icons will appear when users install your PWA.
