# Restart Instructions

## 🔄 To Apply the Component Inference Fix

The backend has been updated with intelligent component detection that will infer components from file names when the GitHub analyzer doesn't detect them in layers.

### Windows (PowerShell)

```powershell
# Stop any running servers
# Press Ctrl+C in the terminal running the backend

# Restart backend
cd backend
npm start

# In a new terminal, restart frontend
cd frontend
npm run dev
```

### Alternative: Use the restart script

```powershell
.\restart-servers.ps1
```

### Linux/Mac

```bash
# Stop any running servers
# Press Ctrl+C in the terminal running the backend

# Restart backend
cd backend
npm start

# In a new terminal, restart frontend
cd frontend
npm run dev
```

### Alternative: Use the restart script

```bash
./restart-servers.sh
```

## 🧪 Test the Fix

1. After restarting, refresh your browser (F5)
2. Enter a repository URL: `https://github.com/spring-projects/spring-petclinic`
3. Click "Analyze Repository"
4. You should now see:
   - Multiple controllers detected (OwnerController, PetController, etc.)
   - Multiple services detected (ClinicService, etc.)
   - Multiple repositories detected (OwnerRepository, etc.)
   - Full multi-layer architecture diagram
   - Repository Flow Panel with component statistics

## 🐛 If Still Showing 0 Components

Check the backend console logs for:

```
🔍 Extracting components from GitHub analysis...
   Controllers found: X
   Services found: Y
   Repositories found: Z
```

If all show 0, you should see:

```
⚠️  No components in layers, inferring from files...
   Inferred X controllers from files
   Inferred Y services from files
   Inferred Z repositories from files
```

## 📊 Expected Results

### For Spring PetClinic:

- **Controllers**: 4-6 controllers
- **Services**: 3-5 services
- **Repositories**: 4-6 repositories
- **Architecture Type**: Layered or Service-Oriented Architecture
- **Confidence**: 60-80%

### Diagram Should Show:

- Client Layer (Web Application)
- API Gateway Layer (API Gateway, Load Balancer)
- API Layer (All detected controllers)
- Services Layer (All detected services)
- Data Layer (All detected repositories + databases)

## 🎯 What Changed

### Backend Fix (`backend/services/deepRepositoryAnalyzer.js`)

- Added `inferComponentsFromFiles()` method
- Scans all files for Controller/Service/Repository patterns
- Automatically falls back when layer detection is empty
- Enhanced logging for debugging

### Frontend Fix (`frontend/src/App.jsx`)

- Repository Flow Panel now only shows when components > 0
- Prevents empty panel from displaying
- Cleaner UI without overlapping elements

## ✅ Verification Checklist

- [ ] Backend restarted successfully
- [ ] Frontend restarted successfully
- [ ] Browser refreshed
- [ ] Repository analyzed
- [ ] Components detected (> 0)
- [ ] Diagram shows multiple layers
- [ ] Repository Flow Panel displays (if components > 0)
- [ ] No UI overlap issues

## 🆘 Troubleshooting

### Issue: Still showing 0 components

**Solution**: Check backend console for errors, ensure GitHub API is accessible

### Issue: UI still overlapping

**Solution**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Backend won't start

**Solution**:

```bash
cd backend
rm -rf node_modules
npm install
npm start
```

### Issue: Frontend won't start

**Solution**:

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

## 📞 Need Help?

Check the logs in:

- Backend terminal for API errors
- Browser console (F12) for frontend errors
- Network tab (F12) for API call failures

## Made with Bob 🤖
