import React, { useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow";
import { toPng } from "html-to-image";
import "reactflow/dist/style.css";

// Icon components for different node types
const NodeIcon = ({ type }) => {
  const icons = {
    frontend: "🎨",
    backend: "⚙️",
    database: "🗄️",
    api: "🔌",
    cache: "⚡",
    queue: "📬",
    auth: "🔐",
    storage: "💾",
    ml: "🤖",
    gateway: "🚪",
    service: "📦",
    microservice: "🔷",
    infrastructure: "☁️",
  };
  return (
    <span style={{ fontSize: "20px", marginRight: "8px" }}>
      {icons[type] || "📦"}
    </span>
  );
};

// Simple Netflix-style custom node component
const CustomNode = ({ data }) => {
  const getColor = (type) => {
    const colors = {
      frontend: "#e0e7ff",
      backend: "#f3e8ff",
      database: "#3b82f6",
      api: "#a855f7",
      cache: "#06b6d4",
      queue: "#f59e0b",
      auth: "#fbbf24",
      storage: "#ef4444",
      ml: "#fbbf24",
      gateway: "#6366f1",
      service: "#10b981",
      microservice: "#059669",
      infrastructure: "#f97316",
    };
    return colors[type] || "#6366f1";
  };

  // Determine size based on importance (from data.size or nodeType)
  const getSize = () => {
    if (data.size === "large") {
      return {
        minWidth: "180px",
        maxWidth: "220px",
        padding: "14px 20px",
        fontSize: "13px",
      };
    } else if (data.size === "medium") {
      return {
        minWidth: "160px",
        maxWidth: "190px",
        padding: "12px 18px",
        fontSize: "12px",
      };
    }
    return {
      minWidth: "140px",
      maxWidth: "170px",
      padding: "10px 16px",
      fontSize: "11px",
    };
  };

  const sizeStyle = getSize();

  return (
    <div
      style={{
        ...sizeStyle,
        borderRadius: "8px",
        background: getColor(data.nodeType),
        border: "2px solid rgba(255, 255, 255, 0.2)",
        color: "#ffffff",
        fontWeight: "600",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
        transition: "all 0.2s ease",
        whiteSpace: "pre-line",
      }}
      className="hover:scale-102"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "4px",
        }}
      >
        <NodeIcon type={data.nodeType} />
      </div>
      <div style={{ wordBreak: "break-word", lineHeight: "1.2" }}>
        {data.label || "Unknown"}
      </div>
      {data.nodeType && (
        <div
          style={{
            fontSize: "8px",
            marginTop: "5px",
            opacity: 0.8,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            background: "rgba(0, 0, 0, 0.2)",
            padding: "2px 5px",
            borderRadius: "3px",
            display: "inline-block",
          }}
        >
          {data.nodeType}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  default: CustomNode,
};

// Download button component
function DownloadButton() {
  const { getNodes } = useReactFlow();
  const imageWidth = 1920;
  const imageHeight = 1080;

  const onClick = () => {
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
    );

    const viewport = document.querySelector(".react-flow__viewport");

    toPng(viewport, {
      backgroundColor: "#0f172a",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then((dataUrl) => {
      const a = document.createElement("a");
      a.setAttribute("download", "architecture-diagram.png");
      a.setAttribute("href", dataUrl);
      a.click();
    });
  };

  return (
    <button
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg transition-all duration-200 flex items-center gap-2"
      onClick={onClick}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Export PNG
    </button>
  );
}

const ArchitectureDiagram = ({ architecture }) => {
  // Process nodes to ensure they have proper dimensions and data
  const processedNodes = React.useMemo(() => {
    if (!architecture?.nodes) return [];

    return architecture.nodes.map((node) => ({
      ...node,
      type: "default",
      data: {
        ...node.data,
        label: node.data?.label || node.label || "Unknown",
        nodeType: node.data?.nodeType || node.type || "service",
        style: node.style,
      },
      style: {
        ...node.style,
        width: node.width || 180,
        height: node.height || 80,
      },
    }));
  }, [architecture?.nodes]);

  // Process edges with enhanced styling including numbered labels and dashed lines
  const processedEdges = React.useMemo(() => {
    if (!architecture?.edges) return [];

    return architecture.edges.map((edge, index) => ({
      ...edge,
      type: "smoothstep",
      animated: true,
      label: edge.label || (edge.numbered ? `${index + 1}` : ""),
      labelStyle: {
        fill: "#ffffff",
        fontWeight: 800,
        fontSize: 13,
        background: edge.dashed ? "#f97316" : "#8b5cf6",
        padding: "4px 8px",
        borderRadius: "50%",
      },
      labelBgStyle: {
        fill: edge.dashed ? "#f97316" : "#8b5cf6",
        fillOpacity: 1,
      },
      labelBgPadding: [10, 10],
      labelBgBorderRadius: 50,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: edge.dashed ? "#f97316" : "#8b5cf6",
      },
      style: {
        ...edge.style,
        strokeWidth: edge.strokeWidth || 2.5,
        stroke: edge.dashed ? "#f97316" : "#8b5cf6",
        strokeDasharray: edge.dashed ? "8,5" : "0",
      },
    }));
  }, [architecture?.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(processedEdges);

  // Update nodes and edges when architecture changes
  useEffect(() => {
    setNodes(processedNodes);
    setEdges(processedEdges);
  }, [processedNodes, processedEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => [...eds, params]),
    [setEdges],
  );

  if (!architecture || !architecture.nodes || architecture.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-card rounded-lg border border-dark-border">
        <div className="text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <p className="text-gray-400 text-lg">
            No architecture data available
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Analyze a repository to see the diagram
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-dark-card rounded-lg border border-dark-border overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{
          padding: 0.3,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={3}
        attributionPosition="bottom-left"
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "#8b5cf6", strokeWidth: 3 },
        }}
      >
        <Panel position="top-right" className="bg-transparent">
          <DownloadButton />
        </Panel>
        <Controls
          className="bg-dark-card border-dark-border shadow-xl"
          showInteractive={false}
        />
        <Background color="#475569" gap={20} size={2} variant="dots" />
      </ReactFlow>
    </div>
  );
};

export default ArchitectureDiagram;

// Made with Bob

// Made with Bob
