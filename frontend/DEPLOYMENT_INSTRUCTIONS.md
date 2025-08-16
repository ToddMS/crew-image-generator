# Deployment Instructions

## Frontend (GitHub Pages)
1. Make changes to frontend code
2. Run `npm run build` to build for production
3. Run `npm run deploy` to deploy to GitHub Pages
4. Visit: https://toddms.github.io/crew-image-generator

## Backend (Railway)
1. Push changes to GitHub
2. Railway will automatically deploy
3. Update the API URL in frontend/.env.production with your Railway URL
4. Rebuild and redeploy frontend

## To update API URL after backend deployment:
1. Edit `frontend/.env.production`
2. Change `VITE_API_URL=https://your-railway-app.railway.app`
3. Run `npm run build && npm run deploy`

## Environment Variables Needed for Railway:
- NODE_ENV=production
- GOOGLE_CLIENT_ID=426083525831-kc55rvgeo24eokfcuij09tm3b81djc26.apps.googleusercontent.com
- GOOGLE_CLIENT_SECRET=your_google_client_secret_here
- FRONTEND_URL=https://toddms.github.io
- SESSION_SECRET=your_super_secret_session_key_here_production
- MAX_FILE_SIZE=5242880
- UPLOAD_DIR=src/assets/club-logos

## Database will be automatically provided by Railway MySQL service