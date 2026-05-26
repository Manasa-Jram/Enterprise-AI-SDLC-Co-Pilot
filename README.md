# Enterprise AI SDLC Co-Pilot

A demo application that analyzes GitHub repositories and generates interactive architecture diagrams using AI-powered insights from the Context Studio MCP server.

![Demo Application](https://img.shields.io/badge/Status-Demo-blue)
![MCP Integration](https://img.shields.io/badge/MCP-Context%20Studio-green)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933)

## 🎯 Features

- **GitHub Repository Analysis**: Automatically analyzes repository structure, dependencies, and configuration files
- **MCP Integration**: Leverages Context Studio MCP server for enhanced AI-powered architecture insights
- **Interactive Diagrams**: Generates dynamic, zoomable architecture diagrams using React Flow
- **Technology Detection**: Identifies frontend, backend, databases, microservices, and infrastructure components
- **Dark Theme UI**: Modern, clean interface with Tailwind CSS
- **Mock Fallback**: Always works with demo data if repository analysis fails

## 🏗️ Architecture

```
Enterprise AI SDLC Co-Pilot/
├── backend/                    # Node.js + Express backend
│   ├── services/
│   │   ├── mcpClient.js       # MCP Context Studio integration
│   │   ├── githubAnalyzer.js  # GitHub repository analyzer
│   │   └── architectureGenerator.js  # Diagram generator
│   ├── server.js              # Express server
│   └── package.json
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArchitectureDiagram.jsx  # React Flow diagram
│   │   │   ├── RepoInput.jsx            # Input form
│   │   │   └── InsightsPanel.jsx        # AI insights display
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── .bob/
    └── mcp.json               # MCP server configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory**

```bash
cd "Enterprise AI SDLC Co-Pilot"
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the backend server** (in `backend/` directory)

```bash
npm start
```

The backend will start on `http://localhost:3001`

2. **Start the frontend development server** (in `frontend/` directory, new terminal)

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

3. **Open your browser**

Navigate to `http://localhost:3000`

## 📖 Usage

### Analyze a Repository

1. Enter a GitHub repository URL (e.g., `https://github.com/facebook/react`)
2. Click **"Analyze Repository"**
3. Wait for the analysis to complete
4. View the generated architecture diagram and AI insights

### Load Demo

Click the **"Load Demo"** button to instantly see a sample architecture diagram with mock data.

## 🔧 MCP Configuration

The application uses the Context Studio MCP server configured in `.bob/mcp.json`. The configuration includes:

- **Server URL**: Context Studio MCP Gateway endpoint
- **Authentication**: Bearer token and API key
- **Type**: Streamable HTTP connection

The MCP client automatically loads this configuration and queries the Context Studio for enhanced architecture analysis.

## 🎨 Technology Stack

### Frontend

- **React 18.2** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Flow** - Interactive diagram visualization
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **Axios** - HTTP client for GitHub API and MCP
- **MCP Client** - Context Studio integration

## 📊 Architecture Detection

The application analyzes repositories to detect:

- **Frontend**: React, Angular, Vue, etc.
- **Backend**: Express, NestJS, Spring Boot, etc.
- **Databases**: MongoDB, PostgreSQL, MySQL, Redis
- **Message Queues**: Kafka, RabbitMQ
- **Infrastructure**: Docker, Kubernetes, Jenkins, GitHub Actions
- **API Patterns**: REST, GraphQL, gRPC

## 🎯 API Endpoints

### Backend API

- `GET /api/health` - Health check and MCP status
- `GET /api/mcp/status` - MCP connection status
- `POST /api/analyze` - Analyze a GitHub repository
  ```json
  {
    "repoUrl": "https://github.com/username/repo"
  }
  ```
- `GET /api/demo` - Get demo architecture data

## 🔍 How It Works

1. **Repository Analysis**
   - Fetches repository metadata from GitHub API
   - Identifies key configuration files (package.json, Dockerfile, etc.)
   - Analyzes dependencies and technologies

2. **MCP Enhancement** (Optional)
   - Queries Context Studio MCP server with repository context
   - Receives AI-powered architecture insights
   - Enhances analysis with contextual understanding

3. **Diagram Generation**
   - Infers architecture components from analysis
   - Generates nodes (services, databases, infrastructure)
   - Creates edges (connections and data flow)
   - Renders interactive diagram with React Flow

4. **Fallback Mechanism**
   - If GitHub API fails → Uses mock repository data
   - If MCP fails → Continues with basic analysis
   - Always provides a working demo experience

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev  # Uses --watch flag for auto-reload
```

### Frontend Development

```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Build for Production

```bash
# Frontend
cd frontend
npm run build

# Backend (no build needed, runs directly)
cd backend
npm start
```

## 🎨 Customization

### Adding New Architecture Patterns

Edit `backend/services/architectureGenerator.js`:

```javascript
detectNewPattern(repoData) {
  // Your detection logic
  return pattern;
}
```

### Customizing Diagram Styles

Edit node styles in `architectureGenerator.js`:

```javascript
getNodeStyle(type) {
  return {
    background: '#color',
    border: '2px solid #color',
    // ... more styles
  };
}
```

### Adding New File Analyzers

Edit `backend/services/githubAnalyzer.js`:

```javascript
identifyKeyFiles(contents) {
  // Add new file patterns
  const keyFilePatterns = [
    'your-file.config',
    // ...
  ];
}
```

## 🐛 Troubleshooting

### Backend won't start

- Check if port 3001 is available
- Verify Node.js version (18+)
- Run `npm install` in backend directory

### Frontend won't start

- Check if port 3000 is available
- Verify Node.js version (18+)
- Run `npm install` in frontend directory

### MCP connection issues

- Verify `.bob/mcp.json` exists and is valid
- Check MCP server URL and authentication tokens
- Application will work without MCP (basic analysis mode)

### GitHub API rate limiting

- GitHub API has rate limits for unauthenticated requests
- Use the "Load Demo" button to bypass GitHub API
- Consider adding GitHub token for higher rate limits

## 📝 Notes

- This is a **demo application** for demonstration purposes
- Not intended for production use
- MCP integration is optional - app works without it
- Mock data ensures the demo always works

## 🤝 Contributing

This is a demo project. Feel free to:

- Extend the architecture detection logic
- Add new diagram node types
- Improve the UI/UX
- Add more MCP integrations

## 📄 License

Demo application - use as reference or starting point for your projects.

## 🙏 Acknowledgments

- **Context Studio MCP** - AI-powered context analysis
- **React Flow** - Interactive diagram library
- **GitHub API** - Repository data access
- **Tailwind CSS** - Styling framework

---

**Built with ❤️ for Enterprise AI SDLC workflows**
