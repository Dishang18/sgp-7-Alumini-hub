# Frontend Environment Configuration

## 📁 Files Created:
- `Frontend/.env` - Environment variables for development
- `Frontend/.env.example` - Template file for other developers
- `Frontend/src/config/api.js` - API configuration utility

## 🔧 Environment Variables:
```bash
VITE_BACKEND_URL=http://localhost:5000
VITE_APP_NAME=Alumni Connect
VITE_API_BASE_URL=http://localhost:5000/api
```

## 📝 Usage:
```javascript
import API_CONFIG from '../config/api';

// Get complete URL
const loginUrl = API_CONFIG.getUrl('/auth/login');
// Returns: http://localhost:5000/auth/login

// Access base URL
console.log(API_CONFIG.BASE_URL); // http://localhost:5000
```

## ✅ Updated Files:
- `src/services/api.js` - Main API service
- `src/services/jobService.js` - Job service  
- `src/pages/Login.jsx` - Login page

## 🚀 Benefits:
1. **Easy deployment** - Change VITE_BACKEND_URL for production
2. **Centralized config** - All API calls use same base URL
3. **Environment flexibility** - Different URLs for dev/staging/production

## 🌐 For Production:
Update `.env` file:
```bash
VITE_BACKEND_URL=https://your-production-api.com
```

## 📋 Next Steps:
Other files with hardcoded URLs can be updated using the same pattern:
1. Import API_CONFIG
2. Replace hardcoded URLs with API_CONFIG.getUrl()