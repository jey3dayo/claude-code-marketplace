# Asset Management

Guide for managing icons, images, and other assets in Chrome Extensions.

## 1. Icon Requirements

### 1.1 Required Icon Sizes

Chrome Extensions require icons in multiple sizes for different contexts:

| Size    | Usage                                 |
| ------- | ------------------------------------- |
| 16x16   | Favicon, extension toolbar            |
| 32x32   | Windows icon small                    |
| 48x48   | Extension management page             |
| 128x128 | Chrome Web Store, installation dialog |

### 1.2 manifest.json Configuration

```json
{
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png"
    }
  }
}
```

## 2. Icon Creation with ImageMagick

### 2.1 Installation

**macOS**:

```bash
brew install imagemagick
```

**Ubuntu/Debian**:

```bash
sudo apt-get install imagemagick
```

**Windows**:

Download from [ImageMagick official site](https://imagemagick.org/script/download.php)

### 2.2 Basic Icon Generation

**From a high-resolution source image**:

```bash
# Create icons directory
mkdir -p icons

# Generate all required sizes
magick images/logo.png -resize 16x16 icons/icon16.png
magick images/logo.png -resize 32x32 icons/icon32.png
magick images/logo.png -resize 48x48 icons/icon48.png
magick images/logo.png -resize 128x128 icons/icon128.png
```

### 2.3 Transparent Background

**Remove white background and make transparent**:

```bash
# Generate with transparency (fuzz adjusts tolerance)
magick images/logo.png -fuzz 10% -transparent white -resize 16x16 icons/icon16.png
magick images/logo.png -fuzz 10% -transparent white -resize 32x32 icons/icon32.png
magick images/logo.png -fuzz 10% -transparent white -resize 48x48 icons/icon48.png
magick images/logo.png -fuzz 10% -transparent white -resize 128x128 icons/icon128.png
```

**Adjust fuzz value**:

- `0%`: Exact color match
- `10%`: Tolerant of slight color variations
- `20%`: More tolerant (may remove unintended colors)

### 2.4 Batch Processing

**Create a script** (`generate-icons.sh`):

```bash
#!/bin/bash

# Source image
SOURCE="images/logo.png"

# Output directory
OUTPUT_DIR="icons"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Sizes to generate
SIZES=(16 32 48 128)

# Generate icons with transparency
for size in "${SIZES[@]}"; do
  echo "Generating ${size}x${size} icon..."
  magick "$SOURCE" \
    -fuzz 10% \
    -transparent white \
    -resize "${size}x${size}" \
    "$OUTPUT_DIR/icon${size}.png"
done

echo "✅ All icons generated successfully!"
```

**Make executable and run**:

```bash
chmod +x generate-icons.sh
./generate-icons.sh
```

## 3. Icon Design Best Practices

### 3.1 Visual Guidelines

**Simplicity**:

- Use simple, recognizable shapes
- Avoid fine details at small sizes
- Ensure clarity at 16x16 pixels

**Consistency**:

- Maintain consistent style across sizes
- Use same color palette
- Keep aspect ratio

**Contrast**:

- Ensure icon is visible on light and dark backgrounds
- Test on various backgrounds
- Use borders/strokes if needed

### 3.2 Testing Icons

**Preview in Browser**:

1. Load extension in Chrome
2. Check toolbar icon (16x16)
3. Check extension management page (48x48)
4. Check Chrome Web Store preview (128x128)

**Preview Command**:

```bash
# Preview icon in default image viewer
open icons/icon128.png  # macOS
xdg-open icons/icon128.png  # Linux
start icons/icon128.png  # Windows
```

## 4. Image Assets for UI

### 4.1 Organization

```
images/
├── logo.png           # Source logo (high-res)
├── header-bg.png      # Popup header background
└── placeholder.png    # Placeholder images

icons/
├── icon16.png
├── icon32.png
├── icon48.png
└── icon128.png
```

### 4.2 Optimization

**Compress PNG images**:

```bash
# Using ImageMagick
magick input.png -quality 85 -strip output.png

# Using pngquant (better compression)
brew install pngquant  # macOS
pngquant --quality=65-80 input.png --output output.png
```

**Convert to WebP** (if size is critical):

```bash
magick input.png -quality 80 output.webp
```

### 4.3 Responsive Images

**Provide 1x and 2x versions** for Retina displays:

```bash
# 1x version
magick images/logo.png -resize 48x48 images/logo-1x.png

# 2x version (double size)
magick images/logo.png -resize 96x96 images/logo-2x.png
```

**Usage in HTML**:

```html
<img src="images/logo-1x.png" srcset="images/logo-2x.png 2x" alt="Logo" width="48" height="48" />
```

## 5. Web Accessible Resources

### 5.1 Configuration

Icons and images used in content scripts must be declared:

```json
{
  "web_accessible_resources": [
    {
      "resources": ["images/*.png", "icons/*.png", "styles/*.css"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### 5.2 Accessing Resources

**In content script**:

```typescript
// Get extension resource URL
const iconUrl = chrome.runtime.getURL('icons/icon48.png')

// Use in DOM
const img = document.createElement('img')
img.src = iconUrl
img.alt = 'Extension icon'
document.body.appendChild(img)
```

## 6. SVG Icons

### 6.1 Advantages

- Scalable without quality loss
- Smaller file size
- Easy to style with CSS

### 6.2 Conversion

**Convert PNG to SVG** (using potrace):

```bash
# Install potrace
brew install potrace  # macOS

# Convert to SVG
potrace input.png -s -o output.svg
```

### 6.3 Inline SVG in Extension

**In popup.html**:

```html
<svg width="48" height="48" viewBox="0 0 48 48" class="icon">
  <circle cx="24" cy="24" r="20" fill="#4285f4" />
  <path d="M..." fill="#ffffff" />
</svg>
```

**Style with CSS**:

```css
.icon {
  width: 48px;
  height: 48px;
}

.icon circle {
  fill: var(--primary-color);
}

.dark-theme .icon circle {
  fill: var(--primary-color-dark);
}
```

## 7. Asset Version Control

### 7.1 .gitignore

**Don't commit generated files**:

```gitignore
# Generated icons (if scripted)
icons/icon*.png

# Temporary images
images/tmp/
*.tmp.png

# Source files (if large)
images/source/
*.psd
*.ai
```

**Do commit**:

- Final optimized assets
- Source logos (if reasonable size)
- Icon generation scripts

### 7.2 Build Process

**package.json script**:

```json
{
  "scripts": {
    "icons": "bash scripts/generate-icons.sh",
    "prebuild": "pnpm run icons",
    "build": "pnpm run clean && pnpm run typecheck && pnpm run bundle"
  }
}
```

## 8. Common Issues and Solutions

### 8.1 "Could not load icon" Error

**Cause**: Icon file missing or wrong path in manifest.json

**Solution**:

```bash
# Check if icons exist
ls -la icons/

# Verify paths in manifest.json
cat manifest.json | grep "icon"

# Regenerate if missing
./scripts/generate-icons.sh
```

### 8.2 Icon Looks Blurry

**Cause**: Low-resolution source image or improper scaling

**Solution**:

- Use high-resolution source (512x512 or higher)
- Ensure source is square
- Use quality filters when resizing:

```bash
magick input.png -resize 48x48 -filter Lanczos output.png
```

### 8.3 Icon Not Updating in Browser

**Cause**: Chrome caches extension icons

**Solution**:

1. Go to `chrome://extensions/`
2. Click "Reload" (or Cmd+R)
3. Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
4. If still not updating, restart Chrome

### 8.4 Transparent Areas Show as White/Black

**Cause**: PNG doesn't have alpha channel or incorrect processing

**Solution**:

```bash
# Ensure PNG has alpha channel
magick input.png -alpha on output.png

# Or convert from non-transparent
magick input.png -fuzz 10% -transparent white -alpha on output.png
```

## 9. Asset Checklist

Before releasing:

- [ ] All required icon sizes present (16, 32, 48, 128)
- [ ] Icons are square (equal width and height)
- [ ] Transparent background (if applicable)
- [ ] Icons visible on light and dark backgrounds
- [ ] Images optimized for file size
- [ ] manifest.json paths are correct
- [ ] web_accessible_resources declared for content script assets
- [ ] Tested in actual extension environment
- [ ] No copyright/trademark violations

## 10. Resources

### 10.1 Design Tools

- [Figma](https://www.figma.com/): UI design and prototyping
- [Inkscape](https://inkscape.org/): Free vector graphics editor
- [GIMP](https://www.gimp.org/): Free image editor
- [ImageMagick](https://imagemagick.org/): Command-line image manipulation

### 10.2 Icon Libraries

- [Material Icons](https://fonts.google.com/icons): Google's icon library
- [Font Awesome](https://fontawesome.com/): Popular icon set
- [Heroicons](https://heroicons.com/): Beautiful hand-crafted SVG icons

### 10.3 Optimization Tools

- [TinyPNG](https://tinypng.com/): Online PNG compression
- [Squoosh](https://squoosh.app/): Image compression web app
- [ImageOptim](https://imageoptim.com/): Mac app for image optimization

---

**Note**: Always test assets in actual browser environment before releasing. Different screen densities and color profiles can affect how icons appear.
