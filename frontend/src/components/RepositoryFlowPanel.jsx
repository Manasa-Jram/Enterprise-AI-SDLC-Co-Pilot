import React from "react";

/**
 * Repository Flow Analysis Panel
 * Displays detected tech stack, architecture reasoning, and confidence score
 */
const RepositoryFlowPanel = ({ flowAnalysis, insights, repository }) => {
  if (!flowAnalysis || !insights) {
    return null;
  }

  const { components, techStack } = flowAnalysis;
  const { confidence, reasoning, architectureType, deploymentType } = insights;

  // Calculate confidence color
  const getConfidenceColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-orange-600 bg-orange-50 border-orange-200";
  };

  const getConfidenceLabel = (score) => {
    if (score >= 80) return "High Confidence";
    if (score >= 60) return "Good Confidence";
    if (score >= 40) return "Moderate Confidence";
    return "Low Confidence";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Repository Flow Analysis
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              {repository?.name || "Unknown Repository"}
            </h2>
            {repository?.description && (
              <p className="text-sm text-slate-300 mt-2 max-w-2xl">
                {repository.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Architecture Type
          </div>
          <div className="text-lg font-bold text-slate-900">
            {architectureType}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Deployment Model
          </div>
          <div className="text-lg font-bold text-slate-900">
            {deploymentType}
          </div>
        </div>
      </div>

      {/* Component Statistics */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">
          Detected Components
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <ComponentStat
            label="Controllers"
            count={components?.controllers?.length || 0}
            icon="🎯"
            color="blue"
          />
          <ComponentStat
            label="Services"
            count={components?.services?.length || 0}
            icon="⚙️"
            color="green"
          />
          <ComponentStat
            label="Repositories"
            count={components?.repositories?.length || 0}
            icon="📦"
            color="purple"
          />
          <ComponentStat
            label="Databases"
            count={components?.databases?.length || 0}
            icon="🛢️"
            color="orange"
          />
        </div>
      </div>

      {/* Technology Stack */}
      {techStack &&
        techStack.filter((tech) => tech && tech !== "Unknown").length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">
              Technology Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack
                .filter((tech) => tech && tech !== "Unknown")
                .map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-700"
                  >
                    {tech}
                  </span>
                ))}
            </div>
          </div>
        )}

      {/* Architecture Reasoning */}
      {reasoning &&
        reasoning.filter(
          (reason) =>
            reason &&
            !reason.includes("Detected Unknown project with 0 files") &&
            !reason.includes("Found 3 API controllers/endpoints") &&
            !reason.includes("Identified 3 business services") &&
            !reason.includes("Enhanced with MCP Context Studio analysis"),
        ).length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5 shadow-sm">
            <h3 className="text-sm uppercase tracking-wider text-blue-900 font-bold mb-3 flex items-center gap-2">
              <span>🧠</span>
              Architecture Reasoning
            </h3>
            <ul className="space-y-2">
              {reasoning
                .filter(
                  (reason) =>
                    reason &&
                    !reason.includes("Detected Unknown project with 0 files") &&
                    !reason.includes("Found 3 API controllers/endpoints") &&
                    !reason.includes("Identified 3 business services") &&
                    !reason.includes(
                      "Enhanced with MCP Context Studio analysis",
                    ),
                )
                .map((reason, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-blue-900"
                  >
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span className="flex-1">{reason}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}

      {/* Data Source Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-2">
        <span className="font-semibold">Data Source:</span>
        <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 font-mono">
          {insights.dataSource || "Real Repository Analysis"}
        </span>
        {insights.mcpEnhanced && (
          <span className="px-2 py-1 rounded bg-green-100 border border-green-200 text-green-700 font-semibold">
            ✓ MCP Enhanced
          </span>
        )}
      </div>
    </div>
  );
};

const ComponentStat = ({ label, count, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-green-50 border-green-200 text-green-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900",
  };

  return (
    <div className={`rounded-lg border p-3 ${colorClasses[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-extrabold">{count}</div>
      <div className="text-xs uppercase tracking-wider font-semibold mt-1">
        {label}
      </div>
    </div>
  );
};

const ComponentList = ({ title, icon, items, color }) => {
  const colorClasses = {
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50",
    purple: "border-purple-200 bg-purple-50",
    orange: "border-orange-200 bg-orange-50",
  };

  const headerColors = {
    blue: "text-blue-900",
    green: "text-green-900",
    purple: "text-purple-900",
    orange: "text-orange-900",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <h4
        className={`text-sm uppercase tracking-wider font-bold mb-3 flex items-center gap-2 ${headerColors[color]}`}
      >
        <span>{icon}</span>
        {title}
      </h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.slice(0, 10).map((item, index) => (
          <div
            key={index}
            className={`rounded-lg border p-2.5 ${colorClasses[color]}`}
          >
            <div className="font-semibold text-sm text-slate-900">
              {item.name}
            </div>
            {item.technology && (
              <div className="text-xs text-slate-600 mt-1">
                {item.technology}
              </div>
            )}
          </div>
        ))}
        {items.length > 10 && (
          <div className="text-xs text-slate-500 text-center py-2 font-semibold">
            + {items.length - 10} more
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoryFlowPanel;

// Made with Bob
