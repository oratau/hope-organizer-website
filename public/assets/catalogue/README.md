# 📸 Business Fields Catalogue Images

Upload your catalogue photos to the respective folders.

## Folder Structure

```
catalogue/
├── grand-opening/          # Grand Opening event photos
├── party/                  # Party Consultant & Organizer photos
├── concert/                # Concert event photos
├── product-launching/      # Product Launching event photos
├── exhibition/             # Exhibition photos
├── gathering/              # Family & Company Gathering photos
├── advertising/            # Advertising campaign photos
└── merchandise/            # Corporate Promotional Merchandise photos
```

## How to Add Photos

1. **Choose the folder** for the business field you want to add photos to
2. **Copy your images** (JPG, PNG, WEBP) into that folder
3. **Name them** sequentially: `img1.jpg`, `img2.jpg`, etc. (or any name)
4. **Update** `src/components/BusinessFields.tsx`:

```typescript
{
  id: 'grand-opening',
  title: 'Grand Opening',
  // ...
  images: [
    '/assets/catalogue/grand-opening/img1.jpg',
    '/assets/catalogue/grand-opening/img2.jpg',
    '/assets/catalogue/grand-opening/img3.jpg',
  ],
},
```

## Recommended Image Specs

- **Format**: JPG or PNG
- **Aspect Ratio**: 4:3 or 16:9 (landscape)
- **Resolution**: 1920x1080px or higher
- **File Size**: < 2MB per image (optimize for web)
- **Quality**: High quality, well-lit photos showcasing your work

## Features

- ✅ Click any business field card to view catalogue
- ✅ Image gallery with prev/next navigation
- ✅ Thumbnail navigation at bottom
- ✅ Keyboard shortcuts: Arrow keys (prev/next), Esc (close)
- ✅ Mobile responsive
- ✅ If no images: Shows "Coming soon" message

## Example Usage

After adding images and updating the code:

1. Visit: http://localhost:5173/
2. Navigate to **Business Fields** section
3. Hover over any card - you'll see "View Catalogue" button
4. Click the card
5. Gallery modal opens with your photos

---

**Note**: Don't forget to commit the images to Git and push to deploy!
