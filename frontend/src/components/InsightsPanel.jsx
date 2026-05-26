import React from "react";

const InsightsPanel = ({ insights, repository }) => {
  if (!insights) {
    return (
      <div className="bg-dark-card rounded-lg border border-dark-border p-6">
        <h2 className="text-xl font-bold text-white mb-4">AI Insights</h2>
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🤖</div>
          <p className="text-gray-400">No insights available yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Analyze a repository to see AI-powered insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-lg border border-dark-border p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">AI Insights</h2>

        {repository && (
          <div className="mb-6 p-4 bg-dark-bg rounded-lg border border-dark-border">
            <h3 className="text-lg font-semibold text-white mb-2">
              {repository.name}
            </h3>
            {repository.description && (
              <p className="text-gray-400 text-sm mb-2">
                {repository.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                {repository.language}
              </span>
              {insights.isMockData && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                  Demo Data
                </span>
              )}
              {insights.isDemo && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                  Demo Mode
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="font-semibold text-white">Architecture Type</h3>
          </div>
          <p className="text-2xl font-bold text-blue-400">
            {insights.architectureType}
          </p>
        </div>

        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            <h3 className="font-semibold text-white">Total Components</h3>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {insights.totalComponents}
          </p>
        </div>

        {insights.technologies && insights.technologies.length > 0 && (
          <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <h3 className="font-semibold text-white">Technologies</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(insights.technologies) ? (
                insights.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30"
                  >
                    {typeof tech === 'string' ? tech : JSON.stringify(tech)}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-500/30">
                  {typeof insights.technologies === 'string'
                    ? insights.technologies
                    : JSON.stringify(insights.technologies)}
                </span>
              )}
            </div>
          </div>
        )}

        {insights.infrastructure && insights.infrastructure.length > 0 && (
          <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-5 h-5 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                />
              </svg>
              <h3 className="font-semibold text-white">Infrastructure</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {insights.infrastructure.map((infra, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-500/20 text-orange-300 text-sm rounded-full border border-orange-500/30"
                >
                  {infra}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <h3 className="font-semibold text-white">MCP Enhanced</h3>
          </div>
          <p className="text-cyan-400">
            {insights.mcpEnhanced
              ? "✓ Yes - Context Studio analyzed"
              : "✗ No - Basic analysis only"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;

// Made with Bob
