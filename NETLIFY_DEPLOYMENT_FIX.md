# 🚀 Deployment Fix Guide

## Problem
Your Netlify deployment shows `GET http://localhost:5000/event/all 401 (Unauthorized)` because it's trying to connect to localhost instead of your Render backend.

## ✅ Solution Steps

### 1. Set Environment Variables in Netlify Dashboard

**Go to Netlify Dashboard:**
1. Visit [netlify.com](https://netlify.com) and login
2. Click on your `alumni-hub26` site
3. Go to **Site settings** → **Environment variables**
4. Click **Add variable** and add these:

```
Variable name: VITE_BACKEND_URL
Value: https://sgp-7-alumini-hub.onrender.com

Variable name: VITE_APP_NAME  
Value: Alumni Connect

Variable name: VITE_API_BASE_URL
Value: https://sgp-7-alumini-hub.onrender.com/api
```

### 2. Redeploy Your Site

**Method 1: Trigger Redeploy**
1. In Netlify dashboard, go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

**Method 2: Push Changes (Recommended)**
```bash
git add .
git commit -m "Add Netlify configuration and production environment"
git push origin main
```

### 3. Verify the Fix

After redeployment:
1. Visit your Netlify site: `https://alumni-hub26.netlify.app`
2. Open browser DevTools (F12) → Console
3. Try logging in - you should see requests going to `https://sgp-7-alumini-hub.onrender.com` instead of `localhost:5000`

## 📋 Files Added/Modified

✅ **Added:** `Frontend/netlify.toml` - Netlify configuration with environment variables
✅ **Added:** `Frontend/.env.production` - Production environment template  
✅ **Modified:** `Frontend/.env` - Set back to local development settings

## 🔍 How to Debug

If it still doesn't work:

1. **Check Netlify Build Log:**
   - Go to Netlify → Deploys → Click on latest deploy
   - Look for environment variables in build log

2. **Check Browser Console:**
   - Open DevTools → Console
   - Look for the backend URL in network requests
   - Should be `https://sgp-7-alumini-hub.onrender.com`, not `localhost:5000`

3. **Check Network Tab:**
   - DevTools → Network tab
   - Try logging in and see what URL is being called

## 🎯 Expected Result

After this fix:
- ✅ Netlify will use the correct Render backend URL
- ✅ No more `localhost:5000` errors in production
- ✅ Login and all API calls will work correctly
- ✅ Local development still uses `localhost:5000`

## 📱 Environment Setup Summary

**Local Development (.env):**
```
VITE_BACKEND_URL=http://localhost:5000
```

**Production (Netlify Environment Variables):**
```  
VITE_BACKEND_URL=https://sgp-7-alumini-hub.onrender.com
```

The deployment error will be fixed once you set the environment variables in Netlify! 🚀