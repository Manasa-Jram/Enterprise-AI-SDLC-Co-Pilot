/**
 * Layout Engine using Dagre
 * Provides hierarchical auto-layout for architecture diagrams
 */

import dagre from "dagre";

/**
 * Apply Dagre layout to nodes and edges
 * @param {Array} nodes - ReactFlow nodes
 * @param {Array} edges - ReactFlow edges
 * @param {String} direction - Layout direction ('LR' = Left to Right, 'TB' = Top to Bottom)
 * @returns {Array} Nodes with calculated positions
 */
export const getLayoutedElements = (nodes, edges, direction = "LR") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure graph layout
  dagreGraph.setGraph({
    rankdir: direction, // LR = Left to Right, TB = Top to Bottom
    align: direction === "LR" ? "UL" : "UR",
    nodesep: 260,
    ranksep: 360,
    marginx: 180,
    marginy: 160,
    edgesep: 120,
    ranker: "network-simplex",
  });

  // Add nodes to graph
  nodes.forEach((node) => {
    const width = node.style?.width || 420;
    const height = node.style?.height || 210;

    dagreGraph.setNode(node.id, {
      width,
      height,
      label: node.data?.label || node.id,
    });
  });

  // Add edges to graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.style?.width || 420;
    const height = node.style?.height || 210;

    return {
      ...node,
      position: {
        // Center the node on its calculated position
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  console.log(
    `✅ Dagre layout applied: ${layoutedNodes.length} nodes positioned`,
  );

  return layoutedNodes;
};

/**
 * Calculate bounding box of all nodes
 * @param {Array} nodes - Nodes with positions
 * @returns {Object} Bounding box {minX, minY, maxX, maxY, width, height}
 */
export const calculateBoundingBox = (nodes) => {
  if (!nodes || nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const width = node.style?.width || 420;
    const height = node.style?.height || 210;

    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + width);
    maxY = Math.max(maxY, node.position.y + height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * Center nodes in viewport
 * @param {Array} nodes - Nodes to center
 * @param {Number} viewportWidth - Viewport width
 * @param {Number} viewportHeight - Viewport height
 * @returns {Array} Centered nodes
 */
export const centerNodes = (
  nodes,
  viewportWidth = 1200,
  viewportHeight = 800,
) => {
  const bbox = calculateBoundingBox(nodes);

  const offsetX = (viewportWidth - bbox.width) / 2 - bbox.minX;
  const offsetY = (viewportHeight - bbox.height) / 2 - bbox.minY;

  return nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY,
    },
  }));
};

// Made with Bob
