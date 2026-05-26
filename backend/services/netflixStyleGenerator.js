class NetflixStyleGenerator {
  constructor() {
    this.nodeId = 0;
    this.edgeId = 0;
    this.layers = [
      {
        id: "client",
        title: "Client Layer",
        subtitle: "User touchpoints and digital channels",
        nodeTypes: ["frontend"],
      },
      {
        id: "edge",
        title: "Edge / API Gateway Layer",
        subtitle: "Traffic routing, security, and edge control",
        nodeTypes: ["gateway", "infrastructure", "auth", "api"],
      },
      {
        id: "services",
        title: "Microservices Layer",
        subtitle: "Domain services and orchestration workflows",
        nodeTypes: ["service", "microservice", "ml"],
      },
      {
        id: "events",
        title: "Event Streaming Layer",
        subtitle: "Async messaging, stream processing, and fan-out",
        nodeTypes: ["queue", "event"],
      },
      {
        id: "data",
        title: "Data & Storage Layer",
        subtitle: "Transactional persistence, search, cache, and storage",
        nodeTypes: ["database", "storage", "cache"],
      },
    ];
  }

  generateNetflixArchitecture(repoData, mcpAnalysis = null) {
    console.log("🎨 Generating enterprise infographic architecture diagram...");

    this.nodeId = 0;
    this.edgeId = 0;

    const services = this.detectServices(repoData, mcpAnalysis);
    const layerConfig = this.buildLayerConfiguration(services);
    const layout = this.buildLayout(layerConfig);

    const nodes = this.createLayerContainerNodes(layerConfig, layout);
    const { nodes: serviceNodes, nodeMap } = this.createServiceNodes(
      layerConfig,
      layout,
    );
    nodes.push(...serviceNodes);

    const edges = this.createArchitectureEdges(layerConfig, nodeMap);
    const metadata = this.buildMetadata(services, nodes, edges, layerConfig);

    console.log(
      `✅ Generated ${metadata.totalNodes} nodes and ${metadata.totalEdges} edges`,
    );

    return {
      nodes,
      edges,
      metadata,
    };
  }

  detectServices(repoData, mcpAnalysis = null) {
    const architecture = repoData.architecture || {};
    const layers = architecture.layers || {};
    const technologies = architecture.technologies || [];
    const infrastructure = architecture.infrastructure || [];
    const databases = architecture.databases || [];
    const relationships = repoData.relationships || [];
    const dependencyGraph = repoData.dependencyGraph || [];

    const normalizeName = (name = "") =>
      name
        .replace(/Controller|Service|Repository|Handler|Manager|Impl/gi, "")
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const unique = (values) => [...new Set(values.filter(Boolean))];

    const serviceCategories = {
      client: [],
      edge: [],
      services: [],
      events: [],
      data: [],
    };

    const inferredServices = unique([
      ...(layers.services || []).map((name) => normalizeName(name)),
      ...(layers.controllers || []).map((name) => normalizeName(name)),
      ...relationships
        .flatMap((relationship) => [
          relationship.source,
          relationship.target,
          relationship.from,
          relationship.to,
        ])
        .map((name) => normalizeName(name || "")),
      ...dependencyGraph
        .flatMap((dep) => [dep.from, dep.to])
        .map((name) => normalizeName(name || "")),
    ]).slice(0, 8);

    const detectedTech = unique([
      ...technologies,
      repoData.language,
      ...(mcpAnalysis?.technologies || []),
      ...(mcpAnalysis?.insights?.technologies || []),
    ]);

    const deploymentType = this.detectDeploymentType(
      infrastructure,
      detectedTech,
      repoData,
    );

    const clientApps = this.detectClientApps(repoData, layers, detectedTech);
    clientApps.forEach((item) => serviceCategories.client.push(item));

    const edgeServices = this.detectEdgeServices(
      repoData,
      layers,
      detectedTech,
      infrastructure,
    );
    edgeServices.forEach((item) => serviceCategories.edge.push(item));

    const domainServices =
      inferredServices.length > 0
        ? inferredServices.map((serviceName) =>
            this.createServiceDescriptor(serviceName, "services"),
          )
        : [
            this.createServiceDescriptor("Identity", "services"),
            this.createServiceDescriptor("Catalog", "services"),
            this.createServiceDescriptor("Payments", "services"),
            this.createServiceDescriptor("Notifications", "services"),
            this.createServiceDescriptor("Orchestration", "services"),
          ];

    domainServices.forEach((item) => serviceCategories.services.push(item));

    const eventServices = this.detectEventServices(
      infrastructure,
      detectedTech,
      domainServices,
    );
    eventServices.forEach((item) => serviceCategories.events.push(item));

    const dataServices = this.detectDataServices(databases, detectedTech);
    dataServices.forEach((item) => serviceCategories.data.push(item));

    const relationshipHints = this.inferRelationships(
      serviceCategories,
      relationships,
      dependencyGraph,
    );

    return {
      technologies: detectedTech,
      infrastructure: unique(infrastructure),
      deploymentType,
      serviceCategories,
      relationshipHints,
      repositoryName: repoData.name || "Repository",
      summary: {
        controllers: layers.controllers?.length || 0,
        services: layers.services?.length || 0,
        repositories: layers.repositories?.length || 0,
        relationships: relationships.length,
      },
    };
  }

  detectDeploymentType(infrastructure, technologies, repoData) {
    const allSignals = [
      ...infrastructure.map((item) => item.toLowerCase()),
      ...technologies.map((item) => String(item).toLowerCase()),
      String(repoData.language || "").toLowerCase(),
    ];

    if (allSignals.some((item) => item.includes("kubernetes"))) {
      return "Cloud-native / Kubernetes";
    }

    if (allSignals.some((item) => item.includes("docker"))) {
      return "Containerized services";
    }

    if (allSignals.some((item) => item.includes("aws"))) {
      return "Cloud hosted";
    }

    return "Application services";
  }

  detectClientApps(repoData, layers, technologies) {
    const clients = [];
    const techSignals = technologies.map((item) => String(item).toLowerCase());

    if (
      techSignals.some((item) =>
        ["react", "vue", "angular", "next.js"].some((tech) =>
          item.includes(tech),
        ),
      )
    ) {
      clients.push({
        label: "Web App",
        type: "frontend",
        layer: "client",
        category: "client",
        technology:
          this.pickTechLabel(technologies, [
            "React",
            "Next.js",
            "Vue",
            "Angular",
          ]) || "Web UI",
      });
    }

    if ((layers.controllers || []).length > 3) {
      clients.push({
        label: "Mobile App",
        type: "frontend",
        layer: "client",
        category: "client",
        technology: "Mobile UX",
      });
    }

    if (clients.length === 0) {
      clients.push({
        label: "Client",
        type: "frontend",
        layer: "client",
        category: "client",
        technology: repoData.language || "Web",
      });
    }

    return clients.slice(0, 2);
  }

  detectEdgeServices(repoData, layers, technologies, infrastructure) {
    const edge = [
      {
        label: "Load Balancer",
        type: "infrastructure",
        layer: "edge",
        category: "edge",
        technology:
          this.pickTechLabel(infrastructure, ["AWS", "CloudFront", "NGINX"]) ||
          "Traffic distribution",
      },
      {
        label: "API Gateway",
        type: "gateway",
        layer: "edge",
        category: "edge",
        technology:
          this.pickTechLabel(technologies, [
            "Express",
            "Spring",
            "Node",
            "Java",
          ]) || "Gateway routing",
      },
    ];

    const authDetected = (layers.controllers || []).some((name) =>
      String(name)
        .toLowerCase()
        .match(/auth|login|identity|oauth/),
    );

    if (authDetected) {
      edge.push({
        label: "Auth API",
        type: "auth",
        layer: "edge",
        category: "edge",
        technology: "OAuth / JWT",
      });
    }

    return edge.slice(0, 3);
  }

  detectEventServices(infrastructure, technologies, domainServices) {
    const signals = [
      ...infrastructure.map((item) => item.toLowerCase()),
      ...technologies.map((item) => String(item).toLowerCase()),
      ...domainServices.map((item) => item.label.toLowerCase()),
    ];

    const events = [];

    events.push({
      label: signals.some((item) => item.includes("kafka"))
        ? "Kafka Consumer"
        : "Event Queue",
      type: "queue",
      layer: "events",
      category: "events",
      technology: signals.some((item) => item.includes("kafka"))
        ? "Apache Kafka"
        : "Async messaging",
    });

    events.push({
      label: "Stream Pipeline",
      type: "event",
      layer: "events",
      category: "events",
      technology: "Stream processing",
    });

    if (
      signals.some((item) =>
        ["spark", "analytics", "search", "stream"].some((term) =>
          item.includes(term),
        ),
      )
    ) {
      events.push({
        label: "Spark Cluster",
        type: "event",
        layer: "events",
        category: "events",
        technology: "Apache Spark",
      });
    }

    return events.slice(0, 3);
  }

  detectDataServices(databases, technologies) {
    const dataNodes = [];
    const dbNames = databases.map((item) =>
      typeof item === "string" ? item : item.name,
    );

    dbNames.slice(0, 5).forEach((name) => {
      dataNodes.push({
        label: name,
        type: this.getDataNodeType(name),
        layer: "data",
        category: "data",
        technology: name,
      });
    });

    if (dataNodes.length === 0) {
      dataNodes.push(
        {
          label: "Database",
          type: "database",
          layer: "data",
          category: "data",
          technology:
            this.pickTechLabel(technologies, [
              "PostgreSQL",
              "MySQL",
              "MongoDB",
            ]) || "Primary DB",
        },
        {
          label: "Cache",
          type: "cache",
          layer: "data",
          category: "data",
          technology: "Redis",
        },
        {
          label: "AWS S3",
          type: "storage",
          layer: "data",
          category: "data",
          technology: "Object storage",
        },
        {
          label: "Hadoop",
          type: "database",
          layer: "data",
          category: "data",
          technology: "Data lake",
        },
        {
          label: "Search Cluster",
          type: "database",
          layer: "data",
          category: "data",
          technology: "Elastic",
        },
      );
    }

    return dataNodes.slice(0, 5);
  }

  inferRelationships(serviceCategories, relationships, dependencyGraph) {
    const explicitRelationships = []
      .concat(relationships || [], dependencyGraph || [])
      .map((rel) => ({
        source: rel.source || rel.from,
        target: rel.target || rel.to,
      }))
      .filter((rel) => rel.source && rel.target);

    const serviceToData = [];
    const eventToData = [];
    const serviceToEvents = [];
    const edgeToServices = [];

    const services = serviceCategories.services;
    const edge = serviceCategories.edge;
    const data = serviceCategories.data;
    const events = serviceCategories.events;

    services.forEach((service, index) => {
      if (data.length > 0) {
        serviceToData.push({
          source: service.label,
          target: data[index % data.length].label,
          mode: "sync",
        });
      }

      if (events.length > 0 && index % 2 === 0) {
        serviceToEvents.push({
          source: service.label,
          target: events[index % events.length].label,
          mode: "async",
        });
      }
    });

    events.forEach((eventNode, index) => {
      if (data.length > 0) {
        eventToData.push({
          source: eventNode.label,
          target: data[(index + 1) % data.length].label,
          mode: "async",
        });
      }
    });

    edge.forEach((edgeNode) => {
      services.slice(0, Math.min(services.length, 4)).forEach((service) => {
        edgeToServices.push({
          source: edgeNode.label,
          target: service.label,
          mode: "sync",
        });
      });
    });

    return {
      explicitRelationships,
      serviceToData,
      eventToData,
      serviceToEvents,
      edgeToServices,
    };
  }

  buildLayerConfiguration(services) {
    return [
      {
        ...this.layers[0],
        nodes: services.serviceCategories.client,
        styleVariant: "client",
      },
      {
        ...this.layers[1],
        nodes: services.serviceCategories.edge,
        styleVariant: "edge",
      },
      {
        ...this.layers[2],
        nodes: services.serviceCategories.services,
        styleVariant: "services",
      },
      {
        ...this.layers[3],
        nodes: services.serviceCategories.events,
        styleVariant: "events",
      },
      {
        ...this.layers[4],
        nodes: services.serviceCategories.data,
        styleVariant: "data",
      },
    ];
  }

  buildLayout(layerConfig) {
    const nodeWidth = 280;
    const nodeHeight = 126;
    const sectionPaddingX = 52;
    const sectionPaddingY = 28;
    const layerGap = 40;
    const rowGap = 20;
    const columnGap = 22;
    const maxColumns = 5;

    const widths = layerConfig.map((layer) => {
      const columns = Math.max(
        1,
        Math.min(maxColumns, layer.nodes.length || 1),
      );
      return (
        sectionPaddingX * 2 + columns * nodeWidth + (columns - 1) * columnGap
      );
    });

    const canvasWidth = Math.max(1720, ...widths);
    let currentY = 24;

    const layers = layerConfig.map((layer) => {
      const nodeCount = Math.max(1, layer.nodes.length || 1);
      const isEventLayer = layer.id === "events";
      const isDataLayer = layer.id === "data";
      const columns =
        isEventLayer || isDataLayer
          ? nodeCount
          : Math.max(1, Math.min(maxColumns, nodeCount));
      const rows =
        isEventLayer || isDataLayer ? 1 : Math.ceil(nodeCount / columns);
      const contentHeight = rows * nodeHeight + Math.max(0, rows - 1) * rowGap;
      const headerHeight = 54;
      const height = sectionPaddingY * 2 + headerHeight + contentHeight;
      const y = currentY;
      currentY += height + layerGap;

      return {
        id: layer.id,
        x: 24,
        y,
        width: canvasWidth,
        height,
        nodeWidth,
        nodeHeight,
        sectionPaddingX,
        sectionPaddingY,
        rowGap,
        columnGap,
        columns,
        headerHeight,
      };
    });

    return {
      canvasWidth: canvasWidth + 48,
      canvasHeight: currentY + 16,
      layers,
    };
  }

  createLayerContainerNodes(layerConfig, layout) {
    return layerConfig.map((layer, index) => {
      const layerLayout = layout.layers[index];

      return {
        id: `layer-${layer.id}`,
        type: "layerGroup",
        position: { x: layerLayout.x, y: layerLayout.y },
        draggable: false,
        selectable: false,
        connectable: false,
        data: {
          label: layer.title,
          subtitle: layer.subtitle,
          layerId: layer.id,
          componentCount: layer.nodes.length,
        },
        style: {
          width: layerLayout.width,
          height: layerLayout.height,
        },
      };
    });
  }

  createServiceNodes(layerConfig, layout) {
    const nodes = [];
    const nodeMap = {};

    layerConfig.forEach((layer, layerIndex) => {
      const layerLayout = layout.layers[layerIndex];
      const totalColumns = Math.max(1, layerLayout.columns);
      const rowCount = Math.ceil(
        Math.max(1, layer.nodes.length) / totalColumns,
      );
      const usableWidth =
        totalColumns * layerLayout.nodeWidth +
        (totalColumns - 1) * layerLayout.columnGap;
      const startX = layerLayout.x + (layerLayout.width - usableWidth) / 2;
      const startY = layerLayout.y + 64;

      layer.nodes.forEach((node, index) => {
        const column = index % totalColumns;
        const row = Math.floor(index / totalColumns);
        const reactFlowNode = {
          id: `node-${this.nodeId++}`,
          type: "enterpriseNode",
          parentNode: `layer-${layer.id}`,
          extent: "parent",
          draggable: false,
          data: {
            ...node,
            size: this.getNodeSize(node, layer.id),
            iconKey: this.getIconKey(node),
          },
          position: {
            x:
              startX -
              layerLayout.x +
              column * (layerLayout.nodeWidth + layerLayout.columnGap),
            y:
              startY -
              layerLayout.y +
              row * (layerLayout.nodeHeight + layerLayout.rowGap),
          },
          style: {
            width: layerLayout.nodeWidth,
            height: layerLayout.nodeHeight,
          },
        };

        nodes.push(reactFlowNode);
        nodeMap[node.label] = reactFlowNode;
      });

      if (layer.nodes.length === 0) {
        const placeholder = {
          id: `node-${this.nodeId++}`,
          type: "enterpriseNode",
          parentNode: `layer-${layer.id}`,
          extent: "parent",
          draggable: false,
          data: {
            label: "No components detected",
            nodeType: "service",
            layer: layer.id,
            category: layer.id,
            technology: "Awaiting detection",
            size: "medium",
            iconKey: "service",
            placeholder: true,
          },
          position: {
            x: (layerLayout.width - layerLayout.nodeWidth) / 2,
            y: 88,
          },
          style: {
            width: layerLayout.nodeWidth,
            height: layerLayout.nodeHeight,
            opacity: 0.55,
          },
        };

        nodes.push(placeholder);
      }
    });

    return { nodes, nodeMap };
  }

  createArchitectureEdges(layerConfig, nodeMap) {
    const edges = [];
    const pushEdge = (sourceLabel, targetLabel, mode = "sync", label = "") => {
      const source = nodeMap[sourceLabel];
      const target = nodeMap[targetLabel];

      if (!source || !target) {
        return;
      }

      edges.push(
        this.createEdge({
          source: source.id,
          target: target.id,
          mode,
          label,
        }),
      );
    };

    const clientNodes = layerConfig[0].nodes;
    const edgeNodes = layerConfig[1].nodes;
    const serviceNodes = layerConfig[2].nodes;
    const eventNodes = layerConfig[3].nodes;
    const dataNodes = layerConfig[4].nodes;

    clientNodes.forEach((client) => {
      edgeNodes.slice(0, 2).forEach((edgeNode) => {
        pushEdge(client.label, edgeNode.label, "sync", "request");
      });
    });

    edgeNodes.forEach((edgeNode) => {
      serviceNodes
        .slice(0, Math.min(serviceNodes.length, 5))
        .forEach((service) => {
          pushEdge(edgeNode.label, service.label, "sync", "route");
        });
    });

    serviceNodes.forEach((service, index) => {
      if (dataNodes.length > 0) {
        pushEdge(
          service.label,
          dataNodes[Math.min(index, dataNodes.length - 1)].label,
          "sync",
          "read/write",
        );
      }

      if (eventNodes.length > 0 && index < Math.min(2, eventNodes.length)) {
        pushEdge(service.label, eventNodes[index].label, "async", "publish");
      }

      if (serviceNodes[index + 1] && index < 2) {
        pushEdge(
          service.label,
          serviceNodes[index + 1].label,
          "sync",
          "orchestrate",
        );
      }
    });

    eventNodes.forEach((eventNode, index) => {
      if (dataNodes.length > 0) {
        pushEdge(
          eventNode.label,
          dataNodes[Math.min(index + 1, dataNodes.length - 1)].label,
          "async",
          "stream",
        );
      }
    });

    return this.deduplicateEdges(edges);
  }

  deduplicateEdges(edges) {
    const seen = new Set();

    return edges.filter((edge) => {
      const key = `${edge.source}-${edge.target}-${edge.data?.flowType}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }

  buildMetadata(services, nodes, edges, layerConfig) {
    const serviceCategories = Object.fromEntries(
      layerConfig.map((layer) => [layer.title, layer.nodes.length]),
    );

    return {
      totalNodes: nodes.filter((node) => node.type !== "layerGroup").length,
      totalEdges: edges.length,
      layers: layerConfig.length,
      componentCount: nodes.filter((node) => node.type !== "layerGroup").length,
      connectionCount: edges.length,
      serviceCategories,
      deploymentType: services.deploymentType,
      repositoryName: services.repositoryName,
      architecture: {
        type: "Enterprise Layered Architecture",
        description:
          "Structured cloud-native architecture with layered boundaries and directional flow",
        technologies: services.technologies,
        infrastructure: services.infrastructure,
      },
    };
  }

  pickTechLabel(values, preferred) {
    return preferred.find((item) =>
      values.some((value) =>
        String(value).toLowerCase().includes(item.toLowerCase()),
      ),
    );
  }

  createServiceDescriptor(name, layer) {
    return {
      label: this.toTitleCase(name),
      type: this.getServiceType(name),
      layer,
      category: layer,
      technology: this.inferTechnologyFromName(name),
    };
  }

  getDataNodeType(name) {
    const value = String(name).toLowerCase();

    if (value.includes("redis") || value.includes("cache")) {
      return "cache";
    }

    if (
      value.includes("s3") ||
      value.includes("blob") ||
      value.includes("storage") ||
      value.includes("document")
    ) {
      return "storage";
    }

    return "database";
  }

  inferTechnologyFromName(name) {
    const value = String(name).toLowerCase();

    if (value.includes("auth") || value.includes("identity")) return "Identity";
    if (value.includes("payment") || value.includes("billing"))
      return "Transactional";
    if (value.includes("notification") || value.includes("message"))
      return "Async";
    if (value.includes("ai") || value.includes("ml") || value.includes("fraud"))
      return "ML";
    if (value.includes("search") || value.includes("catalog"))
      return "Discovery";
    return "Domain service";
  }

  getNodeSize(node, layerId) {
    if (layerId === "edge") return "large";
    if (node.type === "ml" || node.type === "gateway") return "large";
    return "medium";
  }

  getIconKey(node) {
    if (node.type) {
      return node.type;
    }

    return "service";
  }

  getServiceType(serviceName) {
    const name = String(serviceName).toLowerCase();

    if (name.includes("auth") || name.includes("identity")) return "auth";
    if (name.includes("ai") || name.includes("fraud") || name.includes("ml"))
      return "ml";
    if (name.includes("notification") || name.includes("message"))
      return "queue";
    if (
      name.includes("document") ||
      name.includes("file") ||
      name.includes("storage")
    ) {
      return "storage";
    }
    if (
      name.includes("event") ||
      name.includes("stream") ||
      name.includes("workflow")
    ) {
      return "event";
    }
    if (name.includes("gateway") || name.includes("api")) return "gateway";
    if (name.includes("cache") || name.includes("redis")) return "cache";
    if (name.includes("db") || name.includes("sql") || name.includes("mongo")) {
      return "database";
    }

    return "service";
  }

  toTitleCase(value) {
    return String(value)
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  createEdge({ source, target, mode = "sync", label = "" }) {
    return {
      id: `edge-${this.edgeId++}`,
      source,
      target,
      type: "floating",
      animated: mode === "async",
      dashed: mode === "async",
      data: {
        flowType: mode,
        label,
      },
      label,
    };
  }
}

export default new NetflixStyleGenerator();

// Made with Bob
