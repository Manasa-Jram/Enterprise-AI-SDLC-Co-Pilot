# Setup Guide - Enterprise AI SDLC Co-Pilot

Quick setup guide to get the application running in minutes.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- A terminal/command prompt
- A web browser

## 🚀 Installation Steps

### Step 1: Install Dependencies

Open two terminal windows in the project root directory.

**Terminal 1 - Backend:**

```bash
cd backend
npm install
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install
```

Wait for both installations to complete (may take 1-2 minutes).

### Step 2: Start the Backend Server

In **Terminal 1** (backend directory):

```bash
npm start
```

You should see:

```
🚀 Enterprise AI SDLC Co-Pilot Backend
📡 Server running on http://localhost:3001
🤖 MCP Status: ✅ Connected
```

### Step 3: Start the Frontend Server

In **Terminal 2** (frontend directory):

```bash
npm run dev
```

You should see:

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

### Step 4: Open the Application

Open your browser and navigate to:

```
http://localhost:3000
```

## ✅ Verify Installation

You should see:

- ✅ Dark-themed dashboard
- ✅ "Enterprise AI SDLC Co-Pilot" header
- ✅ GitHub repository input field
- ✅ MCP Status indicator (green = connected)
- ✅ "Analyze Repository" and "Load Demo" buttons

## 🎯 First Test

Click the **"Load Demo"** button to see a sample architecture diagram immediately.

## 🔧 Troubleshooting

### Port Already in Use

**Backend (Port 3001):**

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

**Frontend (Port 3000):**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Dependencies Installation Failed

Clear npm cache and retry:

```bash
npm cache clean --force
npm install
```

### MCP Not Connected

The application will still work! MCP is optional:

- ✅ Repository analysis works
- ✅ Architecture diagrams generate
- ✅ Demo mode works
- ⚠️ AI-enhanced insights unavailable

### Module Not Found Errors

Ensure you're in the correct directory:

```bash
# For backend
cd backend
npm install

# For frontend
cd frontend
npm install
```

## 📱 Using the Application

### Analyze a Real Repository

1. Enter a GitHub URL: `https://github.com/facebook/react`
2. Click **"Analyze Repository"**
3. Wait 5-10 seconds
4. View the generated architecture diagram

### Use Demo Mode

1. Click **"Load Demo"**
2. Instantly see a sample microservices architecture
3. Explore the interactive diagram (zoom, pan, drag nodes)

## 🛑 Stopping the Application

Press `Ctrl+C` in both terminal windows to stop the servers.

## 🔄 Restarting

Simply run the start commands again:

```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

## 📚 Next Steps

- Read the main [README.md](README.md) for detailed documentation
- Explore the codebase structure
- Try analyzing different repositories
- Customize the architecture detection logic

## 💡 Tips

- Use **"Load Demo"** for instant results
- GitHub API has rate limits (60 requests/hour without auth)
- The app works offline with demo data
- MCP integration is optional but enhances insights

## 🆘 Need Help?

Common issues:

1. **Blank screen** → Check browser console (F12)
2. **API errors** → Check backend terminal for logs
3. **Diagram not showing** → Try "Load Demo" first
4. **Slow analysis** → GitHub API may be rate-limited

---

**Ready to go!** 🚀 Open http://localhost:3000 and start analyzing!
