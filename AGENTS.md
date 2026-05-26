# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Non-Obvious Patterns

### Server Architecture

- **Backend MUST run on port 3001** - Frontend Vite proxy hardcoded to this port in `frontend/vite.config.js`
- **Frontend runs on port 5173** (Vite default) - NOT 3000 as mentioned in some docs
- Commands MUST be run from subdirectories (`backend/` or `frontend/`), NOT from project root
- Backend uses ES modules (`"type": "module"` in package.json) - all imports require `.js` extensions

### MCP Integration Gotchas

- MCP config at `.bob/mcp.json` contains time-limited auth tokens (Bearer + x-api-key)
- MCP client uses 120-second timeout for queries (not standard 30s) - see `mcpClient.js:70`
- App ALWAYS works without MCP - it's optional enhancement, not a dependency
- MCP uses `context-broker-vector-query` tool (not hybrid query) for faster responses

### Service Layer Patterns

- All services have `setSilentMode()` method to control logging - used by deep analyzer
- `githubAnalyzer.js` handles branch-specific URLs (extracts from `/tree/branch` or `/blob/branch`)
- Architecture generators return mock data on failure - no error propagation to frontend
- `deepRepositoryAnalyzer` is the primary analyzer (not `githubAnalyzer` alone)

### Frontend Specifics

- API calls use relative paths (`/api/*`) - Vite proxy handles routing to backend
- Layout engine (`layoutEngine.js`) uses Dagre with custom spacing: `nodesep: 260, ranksep: 360`
- Node dimensions hardcoded in layout calculations (width: 420, height: 210)
- Demo mode triggered by passing `"demo"` string as repoUrl (not a separate endpoint call)

### Development Workflow

- Use `npm run dev` in backend for auto-reload (uses Node's `--watch` flag)
- No build step for backend - runs directly with Node
- Frontend build outputs to `frontend/dist/` but not used in dev mode
- PowerShell restart script (`restart-servers.ps1`) is informational only - doesn't auto-restart

### File Organization

- Services in `backend/services/` are NOT auto-imported - must be explicitly imported in `server.js`
- Multiple architecture generators exist: `architectureGenerator.js`, `netflixStyleGenerator.js`, `flowBasedArchitectureGenerator.js`, `enterpriseArchitectureGenerator.js`
- Current flow uses `deepRepositoryAnalyzer` → `flowBasedArchitectureGenerator` (see `server.js:44-50`)
