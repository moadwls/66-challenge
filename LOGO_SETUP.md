# LOGO SETUP INSTRUCTIONS

## How to Add Your Custom Logo

1. **Prepare your logo image:**
   - Export your logo as PNG (transparent background recommended)
   - Recommended size: 100-200px height
   - Name it: `logo.png`

2. **Add to project:**
   ```bash
   # Copy your logo to the public folder
   cp /path/to/your/logo.png 66-challenge-final/public/logo.png
   ```

3. **Restart the dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

Your logo will now appear in the orange DAY badge!

## If You Don't Have a Logo Yet

The app will work fine without it. The logo image will simply be hidden until you add `logo.png` to the `/public/` folder.

## Alternative: Use Text Instead

If you want text instead of an image, you can edit `app/today/page.tsx` and replace the `<img>` tag with text like:

```tsx
<span className="text-2xl font-black mr-2">E</span>
```
