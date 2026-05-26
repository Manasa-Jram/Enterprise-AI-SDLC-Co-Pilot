import React, { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  Position,
  ReactFlowProvider,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  MarkerType,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import { toPng } from "html-to-image";
import { getLayoutedElements } from "../utils/layoutEngine";
import "reactflow/dist/style.css";

const LAYER_STYLES = {
  client: {
    border: "#cbd5e1",
    background: "#f8fafc",
    glow: "0 4px 12px rgba(15, 23, 42, 0.04)",
    stripe: "rgba(148, 163, 184, 0.08)",
    badge: "#ffffff",
    badgeBorder: "#dbe3ee",
    title: "#0f172a",
  },
  edge: {
    border: "#cbd5e1",
    background: "#f8fafc",
    glow: "0 4px 12px rgba(15, 23, 42, 0.04)",
    stripe: "rgba(148, 163, 184, 0.08)",
    badge: "#ffffff",
    badgeBorder: "#dbe3ee",
    title: "#0f172a",
  },
  services: {
    border: "#cbd5e1",
    background: "#f8fafc",
    glow: "0 4px 12px rgba(15, 23, 42, 0.04)",
    stripe: "rgba(148, 163, 184, 0.08)",
    badge: "#ffffff",
    badgeBorder: "#dbe3ee",
    title: "#0f172a",
  },
  events: {
    border: "#cbd5e1",
    background: "#f8fafc",
    glow: "0 4px 12px rgba(15, 23, 42, 0.04)",
    stripe: "rgba(148, 163, 184, 0.08)",
    badge: "#ffffff",
    badgeBorder: "#dbe3ee",
    title: "#0f172a",
  },
  data: {
    border: "#cbd5e1",
    background: "#f8fafc",
    glow: "0 4px 12px rgba(15, 23, 42, 0.04)",
    stripe: "rgba(148, 163, 184, 0.08)",
    badge: "#ffffff",
    badgeBorder: "#dbe3ee",
    title: "#0f172a",
  },
};

const NODE_THEME = {
  frontend: {
    icon: "🖥️",
    accent: "#1d4ed8",
    border: "#94a3b8",
    glow: "0 3px 10px rgba(15, 23, 42, 0.06)",
    gradient: "#ffffff",
    text: "#0f172a",
    badge: "#f8fafc",
  },
  gateway: {
    icon: "⚙️",
    accent: "#0891b2",
    border: "#94a3b8",
    glow: "0 3px 10px rgba(15, 23, 42, 0.06)",
    gradient: "#ffffff",
    text: "#0f172a",
    badge: "#f8fafc",
  },
  infrastructure: {
    icon: "☁️",
    accent: "#f59e0b",
    border: "#94a3b8",
    glow: "0 3px 10px rgba(15, 23, 42, 0.06)",
    gradient: "#ffffff",
    text: "#0f172a",
    badge: "#f8fafc",
  },
  auth: {
    icon: "🔐",
    accent: "#16a34a",
    border: "#94a3b8",
    glow: "0 3px 10px rgba(15, 23, 42, 0.06)",
    gradient: "#ffffff",
    text: "#0f172a",
    badge: "#f8fafc",
  },
  service: {
    icon: "⚙️",
    accent: "#16a34a",
    border: "#94a3b8",
    glow: "0 3px 10px rgba(15, 23, 42, 0.06)",
    gradient: "#ffffff",
    text: "#0f172a",
    badge: "#f8fafc",
  },
  microservice: {
    icon: "⚙️",
    accent: "#16a34a",
    border: "#94a3b8",
    glow: "0 3px 10px rgba(15, 23, 42, 0.06)",
    gradient: "#ffffff",
    text: "#0f172a",
    badge: "#f8fafc",
  },
  ml: {
    icon: "🤖",
    accent: "#f59e0b",
    border: "#94a3b8",
    glow: "0 3px 10px rgba(15, 23, 42, 0.06)",
    gradient: "#ffffff",
    text: "#0f172a",
    badge: "#f8fafc",
  },
  queue: {
    icon: "📨",
    accent: "#475569",
    border: "#94a3b8",
    glow: "0 3px 10px rgba(15, 23, 42, 0.06)",
    gradient: "#ffffff",
    text: "#0f172a",
    badge: "#f8fafc",
  },
  event: {
    icon: "🔄",
    accent: "#0f766e",
    border: "#0f766e",
    glow: "0 4px 12px rgba(15, 118, 110, 0.1)",
    gradient: "#0f766e",
    text: "#ffffff",
    badge: "rgba(255,255,255,0.14)",
  },
  database: {
    icon: "🛢️",
    accent: "#65a30d",
    border: "#4d7c0f",
    glow: "0 4px 12px rgba(77, 124, 15, 0.1)",
    gradient: "#65a30d",
    text: "#ffffff",
    badge: "rgba(255,255,255,0.14)",
  },
  cache: {
    icon: "🛢️",
    accent: "#0891b2",
    border: "#0e7490",
    glow: "0 4px 12px rgba(14, 116, 144, 0.1)",
    gradient: "#0891b2",
    text: "#ffffff",
    badge: "rgba(255,255,255,0.14)",
  },
  storage: {
    icon: "🪣",
    accent: "#64748b",
    border: "#94a3b8",
    glow: "0 3px 10px rgba(15, 23, 42, 0.06)",
    gradient: "#ffffff",
    text: "#0f172a",
    badge: "#f8fafc",
  },
};

const getNodeTheme = (type) => NODE_THEME[type] || NODE_THEME.service;
const isCylinderNode = (type) => type === "database" || type === "cache";

const LayerGroupNode = ({ data, selected }) => {
  const layerStyle = LAYER_STYLES[data.layerId] || LAYER_STYLES.services;
  const isClient = data.layerId === "client";
  const isEdge = data.layerId === "edge";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 28,
        border: `3px solid ${selected ? "#111827" : layerStyle.border}`,
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.10)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, transparent 0%, ${layerStyle.stripe} 45%, transparent 100%)`,
          opacity: 0.35,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          padding: "24px 30px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div
          style={{
            color: layerStyle.title,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            textTransform: "uppercase",
          }}
        >
          {isEdge ? "Backend on AWS" : data.label}
        </div>
        <div
          style={{
            color: "#475569",
            background: layerStyle.badge,
            border: `1px solid ${layerStyle.badgeBorder}`,
            borderRadius: 999,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}
        >
          {data.componentCount} components
        </div>
      </div>
    </div>
  );
};

const EnterpriseNode = ({ data, selected }) => {
  const theme = getNodeTheme(data.nodeType);
  const isLarge = data.size === "large";
  const icon = data.iconKey ? getNodeTheme(data.iconKey).icon : theme.icon;
  const cylinder = isCylinderNode(data.nodeType);
  const eventPipeline = data.nodeType === "event";

  if (eventPipeline) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          borderRadius: 999,
          background: theme.gradient,
          border: `2px solid ${selected ? "#111827" : theme.border}`,
          boxShadow: theme.glow,
          color: "#ffffff",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 96,
            height: "100%",
            borderRight: "2px solid rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 38,
            background: "rgba(255,255,255,0.08)",
          }}
        >
          {icon}
        </div>
        <div
          style={{
            flex: 1,
            padding: "0 28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {data.label}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            {data.technology || "Stream processing"}
          </div>
        </div>
        <div
          style={{
            width: 76,
            height: "100%",
            background: "rgba(255,255,255,0.12)",
            borderLeft: "2px solid rgba(255,255,255,0.18)",
          }}
        />
      </div>
    );
  }

  if (cylinder) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          color: theme.text,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "18px 14px 14px",
            borderRadius: "32px / 18px",
            background: theme.gradient,
            border: `2px solid ${selected ? "#111827" : theme.border}`,
            boxShadow: theme.glow,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            top: 6,
            height: 34,
            borderRadius: "50%",
            background:
              data.nodeType === "cache"
                ? "linear-gradient(180deg, #22a49b 0%, #0f766e 100%)"
                : "linear-gradient(180deg, #6da51a 0%, #4d7c0f 100%)",
            border: `2px solid ${selected ? "#111827" : theme.border}`,
            boxShadow: theme.glow,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "42px 22px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "#ffffff",
          }}
        >
          <div style={{ fontSize: 30, marginBottom: 10 }}>{icon}</div>
          <div
            style={{
              fontSize: isLarge ? 24 : 21,
              fontWeight: 800,
              lineHeight: 1.1,
            }}
          >
            {data.label}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
              color: "rgba(255,255,255,0.86)",
            }}
          >
            {data.technology || data.category || data.layer}
          </div>
        </div>
      </div>
    );
  }

  const isClientNode = data.layer === "client";
  const compactLabel = data.label?.replace(" Service", "");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 22,
        padding: isClientNode ? "24px 28px" : "22px 24px",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        border: `2.5px solid ${selected ? "#0f172a" : theme.border}`,
        boxShadow: selected
          ? "0 18px 40px rgba(15, 23, 42, 0.16)"
          : "0 12px 28px rgba(15, 23, 42, 0.10)",
        color: theme.text,
        position: "relative",
        overflow: "hidden",
        transition:
          "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          fontSize: 26,
          color: theme.accent,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          minWidth: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: isLarge ? 24 : 20,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            wordBreak: "break-word",
            color: "#0f172a",
          }}
        >
          {compactLabel}
        </div>
        {data.technology &&
        data.technology !== "Unknown" &&
        data.technology !== "unknown" ? (
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
            }}
          >
            {data.technology}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const FlowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  data,
  label,
  selected,
}) => {
  const isAsync = data?.flowType === "async";
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: isAsync ? 0.22 : 0.16,
  });

  const edgeColor = isAsync ? "#0f6c3a" : "#0b7285";
  const edgeLabel = label || data?.label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: selected ? 7 : 5.5,
          strokeDasharray: isAsync ? "10 6" : "0",
        }}
      />
      {edgeLabel ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
              padding: "8px 14px",
              borderRadius: 999,
              background: "#ffffff",
              border: `1px solid ${isAsync ? "rgba(15,108,58,0.28)" : "rgba(11,114,133,0.22)"}`,
              color: edgeColor,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              boxShadow: "0 4px 10px rgba(15,23,42,0.08)",
              whiteSpace: "nowrap",
            }}
            className="nodrag nopan"
          >
            {edgeLabel}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
};

const nodeTypes = {
  enterpriseNode: EnterpriseNode,
  layerGroup: LayerGroupNode,
};

const edgeTypes = {
  floating: FlowEdge,
};

function DownloadButton() {
  const { getNodes } = useReactFlow();
  const [showMenu, setShowMenu] = React.useState(false);
  const imageWidth = 1920;
  const imageHeight = 1080;

  const exportAsPNG = () => {
    const viewport = document.querySelector(".react-flow__viewport");
    if (!viewport) return;

    toPng(viewport, {
      backgroundColor: "#0f172a",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
      },
      pixelRatio: 2,
    }).then((dataUrl) => {
      const anchor = document.createElement("a");
      anchor.setAttribute("download", "enterprise-architecture-diagram.png");
      anchor.setAttribute("href", dataUrl);
      anchor.click();
      setShowMenu(false);
    });
  };

  const exportAsSVG = () => {
    const viewport = document.querySelector(".react-flow__viewport");
    if (!viewport) return;

    // Clone the viewport to modify for SVG export
    const clone = viewport.cloneNode(true);
    const svgString = new XMLSerializer().serializeToString(clone);

    // Create SVG wrapper
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}">
        <rect width="100%" height="100%" fill="#0f172a"/>
        <g transform="scale(1)">${svgString}</g>
      </svg>
    `;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.setAttribute("download", "enterprise-architecture-diagram.svg");
    anchor.setAttribute("href", url);
    anchor.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        className="bg-white hover:bg-slate-50 text-slate-900 px-4 py-2 rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 flex items-center gap-2 border border-slate-300"
        onClick={() => setShowMenu(!showMenu)}
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
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-5l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export
        <svg
          className={`w-3 h-3 transition-transform ${showMenu ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 min-w-[160px]">
          <button
            onClick={exportAsPNG}
            className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">🖼️</span>
            Export as PNG
          </button>
          <button
            onClick={exportAsSVG}
            className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-2 border-t border-slate-100"
          >
            <span className="text-lg">📐</span>
            Export as SVG
          </button>
        </div>
      )}
    </div>
  );
}

const LegendPill = ({ color, label, dashed = false }) => (
  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-slate-600 font-semibold">
    <span
      style={{
        width: 28,
        height: 0,
        borderTop: `3px ${dashed ? "dashed" : "solid"} ${color}`,
      }}
    />
    <span>{label}</span>
  </div>
);

const DiagramCanvas = ({ architecture }) => {
  const processedNodes = useMemo(() => {
    if (!architecture?.nodes) return [];

    // First, process nodes with proper types and data
    const nodes = architecture.nodes
      .filter((node) => node.type !== "layerGroup")
      .map((node) => {
        const nodeType = node.data?.nodeType || node.type || "service";

        return {
          ...node,
          type: "enterpriseNode",
          sourcePosition:
            nodeType === "event" ? Position.Right : Position.Right,
          targetPosition: Position.Left,
          draggable: false,
          zIndex: 2,
          data: {
            ...node.data,
            label: node.data?.label || node.label || "Unknown",
            nodeType,
            layer: node.data?.layer || "services",
            category: node.data?.category || node.data?.layer || "service",
            size: node.data?.size || "medium",
            technology: node.data?.technology || "Cloud service",
            iconKey: node.data?.iconKey || node.data?.nodeType || "service",
          },
        };
      });

    const layoutNodes = nodes;
    const edges = architecture.edges || [];

    // Apply Dagre layout if available
    try {
      const layoutedNodes = getLayoutedElements(layoutNodes, edges, "TB");

      console.log(
        `✅ Layout applied: ${layoutedNodes.length} nodes positioned`,
      );
      return layoutedNodes;
    } catch (error) {
      console.warn(
        "⚠️  Dagre layout failed, using manual positions:",
        error.message,
      );
      return nodes;
    }
  }, [architecture]);

  const processedEdges = useMemo(() => {
    if (!architecture?.edges) return [];

    return architecture.edges.map((edge) => {
      const isAsync = edge.dashed || edge.data?.flowType === "async";
      const isEvent = edge.data?.flowType === "event";

      // Determine edge styling based on type
      let strokeColor, strokeWidth, strokeDasharray, animated;

      if (isEvent) {
        strokeColor = "#0f766e"; // Teal for events
        strokeWidth = 3.5;
        strokeDasharray = "10 5";
        animated = true;
      } else if (isAsync) {
        strokeColor = "#0f6c3a"; // Green for async
        strokeWidth = 3.2;
        strokeDasharray = "8 6";
        animated = true;
      } else {
        strokeColor = "#0b7285"; // Blue for sync
        strokeWidth = 3.2;
        strokeDasharray = "0";
        animated = false;
      }

      return {
        ...edge,
        type: "floating",
        animated,
        data: {
          ...edge.data,
          flowType: isEvent ? "event" : isAsync ? "async" : "sync",
          label: edge.label || edge.data?.label || "",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: strokeColor,
        },
        style: {
          strokeWidth,
          stroke: strokeColor,
          strokeDasharray,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        },
      };
    });
  }, [architecture]);

  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(processedEdges);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setNodes(processedNodes);
    setEdges(processedEdges);
  }, [processedNodes, processedEdges, setNodes, setEdges]);

  useEffect(() => {
    if (!processedNodes.length) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      fitView({
        nodes: processedNodes,
        padding: 0.08,
        includeHiddenNodes: false,
        minZoom: 0.15,
        maxZoom: 0.9,
        duration: 900,
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [processedNodes, fitView]);

  const onConnect = useCallback(() => {}, []);

  if (!architecture || !architecture.nodes || architecture.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full rounded-2xl border border-slate-300 bg-white">
        <div className="text-center px-6">
          <div className="text-6xl mb-4">🏗️</div>
          <p className="text-slate-900 text-lg font-semibold">
            No architecture data available
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Analyze a repository to render the enterprise architecture
            infographic
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[760px] rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{
          padding: 0.08,
          includeHiddenNodes: false,
          minZoom: 0.15,
          maxZoom: 0.9,
          duration: 900,
        }}
        minZoom={0.1}
        maxZoom={1.2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        zoomOnPinch
        panOnScroll
        attributionPosition="bottom-right"
        className="bg-slate-900"
        defaultEdgeOptions={{
          type: "floating",
          zIndex: 3,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Panel position="top-left" className="bg-transparent !m-3">
          <div className="rounded-xl border border-slate-200/90 bg-white/92 px-3 py-2.5 shadow-sm min-w-[220px] max-w-[280px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                  Enterprise View
                </div>
                <h3 className="text-slate-900 text-base font-extrabold mt-1 tracking-tight leading-none">
                  System Architecture
                </h3>
              </div>
              <DownloadButton />
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-left">
                <div className="text-slate-500 text-[10px] uppercase tracking-[0.12em] font-semibold">
                  Components
                </div>
                <div className="text-slate-900 text-lg font-extrabold mt-1 leading-none">
                  {Math.max(
                    architecture.metadata?.componentCount || 0,
                    (architecture.nodes || []).filter(
                      (node) => node.type !== "layerGroup",
                    ).length,
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-left">
                <div className="text-slate-500 text-[10px] uppercase tracking-[0.12em] font-semibold">
                  Connections
                </div>
                <div className="text-slate-900 text-lg font-extrabold mt-1 leading-none">
                  {architecture.metadata?.connectionCount ||
                    architecture.metadata?.totalEdges ||
                    0}
                </div>
              </div>
            </div>

            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
              <div className="text-slate-500 text-[10px] uppercase tracking-[0.12em] font-semibold">
                Deployment
              </div>
              <div className="text-slate-900 text-xs font-semibold mt-1 leading-snug">
                {architecture.metadata?.deploymentType ||
                  "Cloud-native services"}
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <LegendPill color="#0b7285" label="Sync Flow" />
              <LegendPill color="#0f6c3a" label="Async Flow" dashed />
            </div>
          </div>
        </Panel>

        <Controls
          className="!bg-slate-800 !border !border-slate-700 !shadow-lg [&_button]:!bg-slate-700 [&_button]:!border-slate-600 [&_button]:!text-white [&_button:hover]:!bg-slate-600"
          showInteractive={false}
        />
        <Background color="rgba(71, 85, 105, 0.3)" gap={28} size={1} />
      </ReactFlow>
    </div>
  );
};

const EnterpriseArchitectureDiagram = ({ architecture }) => (
  <ReactFlowProvider>
    <DiagramCanvas architecture={architecture} />
  </ReactFlowProvider>
);

export default EnterpriseArchitectureDiagram;

// Made with Bob
