import express from "express";
import cors from "cors";
import githubAnalyzer from "./services/githubAnalyzer.js";
import mcpClient from "./services/mcpClient.js";
import architectureGenerator from "./services/architectureGenerator.js";
import mcpDataUploader from "./services/mcpDataUploader.js";
import deepRepositoryAnalyzer from "./services/deepRepositoryAnalyzer.js";
import flowBasedArchitectureGenerator from "./services/flowBasedArchitectureGenerator.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mcp: mcpClient.getConnectionStatus(),
  });
});

// MCP connection status endpoint
app.get("/api/mcp/status", (req, res) => {
  const status = mcpClient.getConnectionStatus();
  res.json(status);
});

// Analyze repository endpoint - NEW FLOW-BASED ANALYSIS
app.post("/api/analyze", async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "Repository URL is required" });
    }

    console.log(`\n🔍 Starting DEEP FLOW-BASED analysis for: ${repoUrl}`);

    // NEW: Use Deep Repository Analyzer
    const deepAnalysis =
      await deepRepositoryAnalyzer.analyzeRepositoryDeep(repoUrl);

    // Generate flow-based architecture from real analysis
    console.log("🎨 Generating flow-based architecture diagram...");
    const architecture =
      flowBasedArchitectureGenerator.generateFlowArchitecture(deepAnalysis);

    // Prepare enhanced response
    const response = {
      success: true,
      repository: deepAnalysis.repository,
      architecture,
      insights: {
        totalComponents: architecture.metadata.componentCount,
        architectureType: architecture.metadata.architecture.type,
        technologies: architecture.metadata.architecture.technologies,
        infrastructure: architecture.metadata.architecture.infrastructure,
        deploymentType: architecture.metadata.architecture.deploymentType,
        mcpEnhanced: deepAnalysis.mcpEnhanced,
        confidence: architecture.metadata.confidence,
        reasoning: architecture.metadata.reasoning,
        dataSource: architecture.metadata.dataSource,
      },
      flowAnalysis: {
        components: deepAnalysis.flowComponents,
        executionFlow: deepAnalysis.executionFlow,
        techStack: deepAnalysis.metadata.techStack,
      },
      timestamp: deepAnalysis.timestamp,
    };

    console.log("✅ Deep Flow-Based Analysis Complete!\n");
    res.json(response);
  } catch (error) {
    console.error("❌ Analysis error:", error);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      error: "Failed to analyze repository",
      message: error.message,
      details:
        "Please check if the repository URL is correct and publicly accessible.",
    });
  }
});

// Mock demo endpoint (always returns mock data)
app.get("/api/demo", (req, res) => {
  const mockArchitecture = architectureGenerator.getMockArchitecture();

  res.json({
    success: true,
    repository: {
      name: "demo/microservices-platform",
      description: "Enterprise Microservices Platform (Demo)",
      language: "JavaScript",
    },
    architecture: mockArchitecture,
    insights: {
      totalComponents: mockArchitecture.metadata.totalNodes,
      architectureType: mockArchitecture.metadata.architecture.type,
      technologies: mockArchitecture.metadata.architecture.technologies,
      infrastructure: mockArchitecture.metadata.architecture.infrastructure,
      mcpEnhanced: false,
      isDemo: true,
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Enterprise AI SDLC Co-Pilot Backend`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔗 API endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - GET  /api/mcp/status`);
  console.log(`   - POST /api/analyze`);
  console.log(`   - GET  /api/demo`);

  const mcpStatus = mcpClient.getConnectionStatus();
  console.log(
    `\n🤖 MCP Status: ${mcpStatus.configured ? "✅ Connected" : "❌ Not configured"}`,
  );
  if (mcpStatus.configured) {
    console.log(`   Server: ${mcpStatus.server}`);
  }
  console.log("\n");
});

// Made with Bob
