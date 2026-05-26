class EnterpriseArchitectureGenerator {
  constructor() {
    this.nodeId = 0;
    this.edgeId = 0;
  }

  generateEnterpriseArchitecture(repoData, mcpAnalysis = null) {
    console.log("🎨 Generating Enterprise-Grade Architecture Diagram...");

    const nodes = [];
    const edges = [];
    this.nodeId = 0;
    this.edgeId = 0;

    // Analyze repository to detect services
    const detectedServices = this.detectServices(repoData);
    console.log("📊 Detected Services:", detectedServices);

    // Layout configuration - increased spacing for better visibility
    const layout = {
      layerSpacing: 250,
      nodeSpacing: 280,
      startX: 150,
      startY: 80,
    };

    let currentY = layout.startY;

    // Layer 1: Client Layer
    const clientLayer = this.createClientLayer(
      layout.startX,
      currentY,
      detectedServices,
    );
    nodes.push(...clientLayer.nodes);
    currentY += layout.layerSpacing;

    // Layer 2: API Gateway Layer
    const gatewayLayer = this.createGatewayLayer(
      layout.startX,
      currentY,
      detectedServices,
    );
    nodes.push(...gatewayLayer.nodes);
    edges.push(
      ...this.connectLayers(clientLayer.nodes, gatewayLayer.nodes, "numbered"),
    );
    currentY += layout.layerSpacing;

    // Layer 3: Microservices Layer
    const servicesLayer = this.createMicroservicesLayer(
      layout.startX,
      currentY,
      detectedServices,
    );
    nodes.push(...servicesLayer.nodes);
    edges.push(
      ...this.connectLayers(
        gatewayLayer.nodes,
        servicesLayer.nodes,
        "numbered",
      ),
    );
    currentY += layout.layerSpacing;

    // Layer 4: Messaging/Event Layer
    const messagingLayer = this.createMessagingLayer(
      layout.startX,
      currentY,
      detectedServices,
    );
    nodes.push(...messagingLayer.nodes);
    edges.push(
      ...this.connectLayers(
        servicesLayer.nodes,
        messagingLayer.nodes,
        "dashed",
      ),
    );
    currentY += layout.layerSpacing;

    // Layer 5: Database & Storage Layer
    const dataLayer = this.createDataLayer(
      layout.startX,
      currentY,
      detectedServices,
    );
    nodes.push(...dataLayer.nodes);
    edges.push(
      ...this.connectLayers(servicesLayer.nodes, dataLayer.nodes, "dashed"),
    );
    edges.push(
      ...this.connectLayers(messagingLayer.nodes, dataLayer.nodes, "dashed"),
    );

    // Add layer group nodes (visual containers)
    const layerGroups = this.createLayerGroups([
      { name: "Client Layer", y: layout.startY, nodes: clientLayer.nodes },
      {
        name: "API Gateway Layer",
        y: layout.startY + layout.layerSpacing,
        nodes: gatewayLayer.nodes,
      },
      {
        name: "Microservices Layer",
        y: layout.startY + layout.layerSpacing * 2,
        nodes: servicesLayer.nodes,
      },
      {
        name: "Messaging Layer",
        y: layout.startY + layout.layerSpacing * 3,
        nodes: messagingLayer.nodes,
      },
      {
        name: "Data Layer",
        y: layout.startY + layout.layerSpacing * 4,
        nodes: dataLayer.nodes,
      },
    ]);

    console.log(`✅ Generated ${nodes.length} nodes and ${edges.length} edges`);

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        layers: 5,
        architecture: {
          type: "Enterprise Microservices Architecture",
          description:
            "Production-grade cloud-native architecture with layered services",
          technologies: detectedServices.technologies,
          infrastructure: detectedServices.infrastructure,
        },
      },
    };
  }

  detectServices(repoData) {
    const services = {
      frontend: [],
      apis: [],
      microservices: [],
      databases: [],
      messaging: [],
      storage: [],
      auth: false,
      ai: false,
      technologies: [],
      infrastructure: [],
    };

    // Detect from repository structure
    const layers = repoData.architecture?.layers || {};

    // Frontend detection
    if (
      repoData.language === "JavaScript" ||
      repoData.language === "TypeScript"
    ) {
      services.frontend.push("Web Application");
    }
    if (layers.controllers?.length > 0) {
      services.frontend.push("Mobile App");
    }

    // API detection
    if (layers.controllers) {
      services.apis = layers.controllers
        .slice(0, 5)
        .map((c) => c.replace("Controller", "").replace("API", "") + " API");
    }

    // Microservices detection
    if (layers.services) {
      services.microservices = layers.services
        .slice(0, 6)
        .map((s) => s.replace("Service", "").replace("Impl", "") + " Service");
    }

    // Add essential enterprise services
    if (services.microservices.length === 0) {
      services.microservices = [
        "User Service",
        "Auth Service",
        "Transaction Service",
        "Notification Service",
        "AI Fraud Detection",
        "Document Service",
      ];
    }

    // Database detection
    const dbPatterns = repoData.architecture?.databases || [];
    if (dbPatterns.length > 0) {
      services.databases = dbPatterns.map((db) => db.name || db);
    } else {
      services.databases = ["PostgreSQL", "MongoDB", "Redis Cache"];
    }

    // Messaging detection
    const infraPatterns = repoData.architecture?.infrastructure || [];
    if (infraPatterns.some((i) => i.toLowerCase().includes("kafka"))) {
      services.messaging.push("Apache Kafka");
    }
    if (infraPatterns.some((i) => i.toLowerCase().includes("rabbit"))) {
      services.messaging.push("RabbitMQ");
    }
    if (services.messaging.length === 0) {
      services.messaging = ["Event Bus", "Message Queue"];
    }

    // Storage detection
    services.storage = ["AWS S3", "Document Storage"];

    // Auth detection
    services.auth =
      layers.controllers?.some(
        (c) =>
          c.toLowerCase().includes("auth") || c.toLowerCase().includes("login"),
      ) || false;

    // AI detection
    services.ai =
      layers.services?.some(
        (s) => s.toLowerCase().includes("ai") || s.toLowerCase().includes("ml"),
      ) || false;

    // Technologies
    services.technologies = repoData.architecture?.technologies || [
      "React",
      "Node.js",
      "Spring Boot",
      "Docker",
      "Kubernetes",
    ];

    // Infrastructure
    services.infrastructure =
      infraPatterns.length > 0
        ? infraPatterns
        : ["AWS", "Docker", "Kubernetes", "Terraform"];

    return services;
  }

  createClientLayer(startX, startY, services) {
    const nodes = [];
    const spacing = 250;

    services.frontend.forEach((app, i) => {
      nodes.push(
        this.createNode({
          label: app,
          type: "frontend",
          position: { x: startX + i * spacing, y: startY },
          layer: "client",
        }),
      );
    });

    if (nodes.length === 0) {
      nodes.push(
        this.createNode({
          label: "Web Client",
          type: "frontend",
          position: { x: startX, y: startY },
          layer: "client",
        }),
      );
    }

    return { nodes };
  }

  createGatewayLayer(startX, startY, services) {
    const nodes = [];

    nodes.push(
      this.createNode({
        label: "API Gateway",
        type: "gateway",
        position: { x: startX + 200, y: startY },
        layer: "gateway",
        size: "large",
      }),
    );

    nodes.push(
      this.createNode({
        label: "Load Balancer",
        type: "infrastructure",
        position: { x: startX + 500, y: startY },
        layer: "gateway",
        size: "large",
      }),
    );

    if (services.auth) {
      nodes.push(
        this.createNode({
          label: "Auth Service",
          type: "auth",
          position: { x: startX + 800, y: startY },
          layer: "gateway",
        }),
      );
    }

    return { nodes };
  }

  createMicroservicesLayer(startX, startY, services) {
    const nodes = [];
    const spacing = 300;
    const rowSpacing = 160;
    const servicesPerRow = 3;

    services.microservices.forEach((service, i) => {
      const row = Math.floor(i / servicesPerRow);
      const col = i % servicesPerRow;

      nodes.push(
        this.createNode({
          label: service,
          type: this.getServiceType(service),
          position: {
            x: startX + col * spacing,
            y: startY + row * rowSpacing,
          },
          layer: "microservices",
        }),
      );
    });

    return { nodes };
  }

  createMessagingLayer(startX, startY, services) {
    const nodes = [];
    const spacing = 320;

    services.messaging.forEach((msg, i) => {
      nodes.push(
        this.createNode({
          label: msg,
          type: "queue",
          position: { x: startX + i * spacing, y: startY },
          layer: "messaging",
        }),
      );
    });

    // Add stream processing if Kafka detected
    if (services.messaging.some((m) => m.includes("Kafka"))) {
      nodes.push(
        this.createNode({
          label: "Stream Processing",
          type: "microservice",
          position: {
            x: startX + services.messaging.length * spacing,
            y: startY,
          },
          layer: "messaging",
        }),
      );
    }

    return { nodes };
  }

  createDataLayer(startX, startY, services) {
    const nodes = [];
    const spacing = 300;

    services.databases.forEach((db, i) => {
      nodes.push(
        this.createNode({
          label: db,
          type: "database",
          position: { x: startX + i * spacing, y: startY },
          layer: "data",
        }),
      );
    });

    services.storage.forEach((storage, i) => {
      nodes.push(
        this.createNode({
          label: storage,
          type: "storage",
          position: {
            x: startX + (services.databases.length + i) * spacing,
            y: startY,
          },
          layer: "data",
        }),
      );
    });

    return { nodes };
  }

  getServiceType(serviceName) {
    const name = serviceName.toLowerCase();
    if (name.includes("auth")) return "auth";
    if (name.includes("ai") || name.includes("fraud")) return "ml";
    if (name.includes("notification")) return "queue";
    if (name.includes("document") || name.includes("file")) return "storage";
    return "service";
  }

  createNode({ label, type, position, layer, size = "medium" }) {
    return {
      id: `node-${this.nodeId++}`,
      type: "custom",
      data: {
        label,
        nodeType: type,
        layer,
        size,
      },
      position,
      style: {
        width: size === "large" ? 200 : 180,
        height: size === "large" ? 100 : 90,
      },
    };
  }

  connectLayers(sourceNodes, targetNodes, style = "numbered") {
    const edges = [];

    if (sourceNodes.length === 0 || targetNodes.length === 0) {
      return edges;
    }

    // Connect each source to all targets for full connectivity
    sourceNodes.forEach((source) => {
      targetNodes.forEach((target) => {
        edges.push({
          id: `edge-${this.edgeId++}`,
          source: source.id,
          target: target.id,
          type: "smoothstep",
          animated: true,
          numbered: style === "numbered",
          dashed: style === "dashed",
          label: style === "numbered" ? `${this.edgeId}` : "",
        });
      });
    });

    return edges;
  }

  createLayerGroups(layers) {
    // This would create visual group containers
    // For now, we'll handle this in the frontend component
    return layers;
  }
}

export default new EnterpriseArchitectureGenerator();

// Made with Bob
