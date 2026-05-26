import React, { useState, useEffect } from "react";
import axios from "axios";
import RepoInput from "./components/RepoInput";
import EnterpriseArchitectureDiagram from "./components/EnterpriseArchitectureDiagram";
import InsightsPanel from "./components/InsightsPanel";
import RepositoryFlowPanel from "./components/RepositoryFlowPanel";

function App() {
  const [loading, setLoading] = useState(false);
  const [architecture, setArchitecture] = useState(null);
  const [insights, setInsights] = useState(null);
  const [repository, setRepository] = useState(null);
  const [flowAnalysis, setFlowAnalysis] = useState(null);
  const [mcpStatus, setMcpStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch MCP status on mount
    fetchMcpStatus();
  }, []);

  const fetchMcpStatus = async () => {
    try {
      const response = await axios.get("/api/mcp/status");
      setMcpStatus(response.data);
    } catch (err) {
      console.error("Failed to fetch MCP status:", err);
      setMcpStatus({ configured: false });
    }
  };

  const handleAnalyze = async (repoUrl) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (repoUrl === "demo") {
        // Load demo data
        response = await axios.get("/api/demo");
      } else {
        // Analyze real repository
        response = await axios.post("/api/analyze", { repoUrl });
      }

      if (response.data.success) {
        setArchitecture(response.data.architecture);
        setInsights(response.data.insights);
        setRepository(response.data.repository);
        setFlowAnalysis(response.data.flowAnalysis || null);
      } else {
        setError("Analysis failed. Please try again.");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to analyze repository. Please check the URL and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🤖</div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Enterprise AI SDLC Co-Pilot
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  AI-Powered Architecture Analysis & Visualization
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Input Section */}
          <RepoInput
            onAnalyze={handleAnalyze}
            loading={loading}
            mcpStatus={mcpStatus}
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Repository Flow Analysis Panel */}
          {flowAnalysis &&
            flowAnalysis.components &&
            flowAnalysis.components.totalComponents > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <RepositoryFlowPanel
                  flowAnalysis={flowAnalysis}
                  insights={insights}
                  repository={repository}
                />
              </div>
            )}

          {/* Architecture Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Diagram - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="bg-dark-card rounded-lg border border-dark-border p-4 h-[760px] overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Architecture Diagram
                  </h2>
                  {architecture && (
                    <span className="text-sm text-gray-400">
                      {architecture.metadata?.totalNodes || 0} components •{" "}
                      {architecture.metadata?.totalEdges || 0} connections
                    </span>
                  )}
                </div>
                <div className="h-[680px] overflow-hidden">
                  <EnterpriseArchitectureDiagram architecture={architecture} />
                </div>
              </div>
            </div>

            {/* Insights Panel - Takes 1 column */}
            <div className="lg:col-span-1">
              <InsightsPanel insights={insights} repository={repository} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark-card border-t border-dark-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-400 text-sm">
            Enterprise AI SDLC Co-Pilot • Demo Application • Powered by MCP &
            React Flow
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

// Made with Bob
