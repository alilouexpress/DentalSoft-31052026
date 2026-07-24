# How to Export Your DentalSoft Project

## Method 1: Using Git (Recommended)

Since your project is on Replit, you can export it using Git commands:

1. Open the **Console** tab (at the top)
2. Run these commands:

```bash
cd /home/runner/workspace
git init
git add .
git commit -m "Export DentalSoft project"
git archive --format zip -o dentalsoft-project.zip HEAD
```

3. Once complete, the `dentalsoft-project.zip` file will be in your workspace root
4. Check the Files panel on the left - you should see `dentalsoft-project.zip`
5. Right-click on it and select "Download"

## Method 2: Download Individual Folders

You can also download individual folders:

1. In the **Files panel** on the left
2. Right-click on folders like:
   - `client/` - Frontend React code
   - `server/` - Backend Express code
   - `shared/` - Shared types and schemas
   - `migrations/` - Database migrations

3. Look for "Download" option in the context menu

## Method 3: Contact Replit Support

If the above methods don't work, you can:
- Check if you're using a free tier (some export features require paid accounts)
- Contact Replit support through the Help menu

## What's Included in Your Project

Your DentalSoft project contains:

### Frontend (`client/`)
- React components and pages
- Styling with Tailwind CSS
- API integration hooks

### Backend (`server/`)
- Express.js server
- Database queries and storage layer
- API routes for patients, doctors, and appointments

### Database (`shared/schema.ts`)
- Patient records
- Doctor profiles
- Appointment scheduling
- Data relationships

### Configuration Files
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `drizzle.config.ts` - Database config
- `vite.config.ts` - Build config

## Restore Your Project

To restore this project on another machine:

1. Extract the ZIP file
2. Run: `npm install`
3. Set up environment variables (if needed)
4. Run: `npm run dev`

---

If you continue to have issues, please let me know which method you tried and I can help troubleshoot!
