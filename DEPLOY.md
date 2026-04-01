# Deployment checklist

## Before you deploy

- [ ] Both `npm run build` commands pass with 0 errors
- [ ] `/app/.env.local` has `GROQ_API_KEY` and `GEMINI_API_KEY`
- [ ] `/landing/.env.local` has `NEXT_PUBLIC_APP_URL`

## Deploy to Vercel

### App (deploy first)
```bash
cd app
npx vercel --prod
```

Copy the deployment URL.

### Add env vars to app on Vercel dashboard

- `GROQ_API_KEY` → your `gsk_...` key
- `GEMINI_API_KEY` → your `AIza...` key
- `NEXT_PUBLIC_LANDING_URL` → your landing URL
- `NEXT_PUBLIC_APP_URL` → your app URL

### Landing (deploy second)
```bash
cd landing
npx vercel --prod
```

Copy the deployment URL.

### Add env vars to landing on Vercel dashboard

- `NEXT_PUBLIC_APP_URL` → your app URL
- `NEXT_PUBLIC_LANDING_URL` → your landing URL

### Final step

Go back to the app on Vercel and confirm `NEXT_PUBLIC_LANDING_URL` points at the landing deployment. Redeploy the app once more if needed.

## Verify deployment

1. Open the landing URL
2. Click "Analyze your script free →" and confirm it opens `/analyze`
3. Paste a script and run an analysis
4. Confirm results, insights, and PDF download work
5. Click the NeuroDraft logo in the app and confirm it returns to landing

## Custom domain (optional)

In Vercel dashboard → Domains:

- Landing: `neurodraft.com`
- App: `app.neurodraft.com`

Then update the public env vars to use those domains.
