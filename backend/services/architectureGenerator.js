import netflixStyleGenerator from "./netflixStyleGenerator.js";

class ArchitectureGenerator {
  constructor() {
    this.silent = false; // Control logging
  }

  setSilentMode(silent) {
    this.silent = silent;
  }

  log(...args) {
    if (!this.silent) {
      console.log(...args);
    }
  }

  generateArchitectureDiagram(repoData, mcpAnalysis = null) {
    this.log("🎨 Generating Netflix-Style Architecture Diagram...");
    this.log("📊 MCP Analysis available:", mcpAnalysis !== null);
    this.log(
      "📂 Repo data:",
      JSON.stringify({
        name: repoData.name,
        language: repoData.language,
        hasArchitecture: !!repoData.architecture,
        componentsCount: repoData.architecture?.components?.length || 0,
        hasDependencyGraph: !!repoData.dependencyGraph,
        relationshipsCount: repoData.relationships?.length || 0,
      }),
    );

    // Use Netflix-style generator for clean horizontal flow
    this.log("✨ Using Netflix-Style Architecture Generator");
    return netflixStyleGenerator.generateNetflixArchitecture(
      repoData,
      mcpAnalysis,
    );
  }

  generateArchitectureDiagramOld(repoData, mcpAnalysis = null) {
    // Keep old method as fallback
    this.log("✨ Generating clean application flow diagram");
    return this.generateCleanFlowDiagram(repoData, mcpAnalysis);
  }

  generateCleanFlowDiagram(repoData, mcpAnalysis = null) {
    this.log("🎨 Creating Netflix-style microservices architecture...");

    const nodes = [];
    const edges = [];
    let nodeId = 0;

    // Helper to create node with variable sizing based on importance
    const createNode = (label, type, position, metadata = {}) => {
      // Determine size based on component importance
      let size = "small";
      let width = 160;
      let height = 80;

      if (
        type === "gateway" ||
        type === "infrastructure" ||
        label.includes("Gateway") ||
        label.includes("Load Balancer")
      ) {
        size = "large";
        width = 200;
        height = 100;
      } else if (
        type === "api" ||
        type === "service" ||
        type === "microservice"
      ) {
        size = "medium";
        width = 180;
        height = 90;
      } else if (type === "database" || type === "cache") {
        size = "medium";
        width = 180;
        height = 90;
      }

      return {
        id: `node-${nodeId++}`,
        type: "default",
        data: {
          label,
          nodeType: type,
          size,
          ...metadata,
        },
        position,
        style: {
          ...this.getNodeStyle(type),
          width,
          height,
        },
        width,
        height,
      };
    };

    // Helper to create edge with numbering and dashing options
    let edgeCounter = 1;
    const createEdge = (source, target, label = "", options = {}) => ({
      id: `edge-${source}-${target}-${Date.now()}-${Math.random()}`,
      source,
      target,
      label: options.numbered ? `${edgeCounter++}` : label,
      animated: true,
      numbered: options.numbered || false,
      dashed: options.dashed || false,
      strokeWidth: options.strokeWidth || 3,
      style: {
        stroke: options.dashed ? "#6366f1" : "#8b5cf6",
        strokeWidth: options.strokeWidth || 3,
        strokeDasharray: options.dashed ? "5,5" : "0",
      },
    });

    const layers = repoData.architecture?.layers || {};
    let controllers = layers.controllers || [];
    let services = layers.services || [];
    let repositories = layers.repositories || [];

    // If no components detected, create rich demo architecture
    if (
      controllers.length === 0 &&
      services.length === 0 &&
      repositories.length === 0
    ) {
      this.log("⚠️ No components detected, creating rich demo architecture");

      // Create a comprehensive microservices architecture
      controllers = ["Signup", "Discovery", "Play"];
      services = ["Application API", "More Service"];
      repositories = ["Stream Processing"];
    }

    // Log detected components
    this.log(`📊 Architecture components:`);
    this.log(`   Controllers: ${controllers.length}`);
    this.log(`   Services: ${services.length}`);
    this.log(`   Repositories: ${repositories.length}`);

    // Netflix-style layout - horizontal with proper spacing to avoid overlap
    const clientX = 50;
    const backendStartX = 350;
    const horizontalSpacing = 280;
    const verticalSpacing = 140;
    const yTop = 50;
    const yMiddle = 300;
    const yBottom = 550;

    // CLIENT SECTION (Left side)
    const clientNode = createNode("Client", "frontend", {
      x: clientX,
      y: yMiddle,
    });
    nodes.push(clientNode);

    // BACKEND SECTION (Right side - properly spaced)
    // Column 1: Load Balancer
    const lbNode = createNode("AWS Elastic\nLoad Balancer", "infrastructure", {
      x: backendStartX,
      y: yTop,
    });
    nodes.push(lbNode);

    // Column 2: API Gateway
    const gatewayNode = createNode("API Gateway", "gateway", {
      x: backendStartX + horizontalSpacing,
      y: yTop,
    });
    nodes.push(gatewayNode);

    // Column 3: Application APIs (Signup, Discovery, Play) - vertically stacked
    const apiNodes = [];
    const apiX = backendStartX + horizontalSpacing * 2;

    controllers.slice(0, 3).forEach((controller, i) => {
      const node = createNode(controller + " API", "api", {
        x: apiX,
        y: yTop + i * verticalSpacing,
      });
      nodes.push(node);
      apiNodes.push(node);
    });

    // Column 4: Cache and More Service
    const cacheNode = createNode("Cache", "cache", {
      x: backendStartX + horizontalSpacing * 3,
      y: yTop,
    });
    nodes.push(cacheNode);

    const moreServiceNode = createNode("More Service", "service", {
      x: backendStartX + horizontalSpacing * 3,
      y: yTop + verticalSpacing,
    });
    nodes.push(moreServiceNode);

    // Middle row: Stream Processing and Kafka
    const streamNode = createNode(
      "Stream Processing\nPipeline",
      "microservice",
      {
        x: backendStartX + horizontalSpacing * 2,
        y: yMiddle + 50,
      },
    );
    nodes.push(streamNode);

    const kafkaConsumerNode = createNode(
      "Notification\nKafka Consumer",
      "queue",
      {
        x: backendStartX,
        y: yMiddle + 50,
      },
    );
    nodes.push(kafkaConsumerNode);

    const sparkNode = createNode(
      "Apache Spark\nStreaming Cluster",
      "infrastructure",
      {
        x: backendStartX,
        y: yMiddle + 200,
      },
    );
    nodes.push(sparkNode);

    // Bottom row: Databases - properly spaced
    const searchKafkaNode = createNode("Search Kafka\nConsumer", "queue", {
      x: backendStartX + 50,
      y: yBottom,
    });
    nodes.push(searchKafkaNode);

    const elasticNode = createNode("Elastic Search\nCluster", "database", {
      x: backendStartX + horizontalSpacing,
      y: yBottom,
    });
    nodes.push(elasticNode);

    const s3Node = createNode("AWS S3", "storage", {
      x: backendStartX + horizontalSpacing * 2,
      y: yBottom,
    });
    nodes.push(s3Node);

    const hadoopNode = createNode("Hadoop", "database", {
      x: backendStartX + horizontalSpacing * 3,
      y: yBottom,
    });
    nodes.push(hadoopNode);

    const mainDbNode = createNode("Database", "database", {
      x: backendStartX + horizontalSpacing * 4,
      y: yBottom,
    });
    nodes.push(mainDbNode);

    // EDGES - Netflix flow pattern
    // 1. Client to Load Balancer
    edges.push(createEdge(clientNode.id, lbNode.id, "", { numbered: true }));

    // 2. Load Balancer to API Gateway
    edges.push(createEdge(lbNode.id, gatewayNode.id, "", { numbered: true }));

    // 3. API Gateway to APIs
    apiNodes.forEach((apiNode) => {
      edges.push(
        createEdge(gatewayNode.id, apiNode.id, "", {
          numbered: true,
          dashed: true,
        }),
      );
    });

    // 4. APIs to More Service and Cache
    if (apiNodes.length > 0) {
      edges.push(
        createEdge(apiNodes[0].id, moreServiceNode.id, "", {
          numbered: true,
          dashed: true,
        }),
      );
      edges.push(
        createEdge(moreServiceNode.id, cacheNode.id, "", {
          numbered: true,
          dashed: true,
        }),
      );
    }

    // 5. More Service to Database
    edges.push(
      createEdge(moreServiceNode.id, mainDbNode.id, "", {
        numbered: true,
        dashed: true,
      }),
    );

    // 6. Stream Processing connections
    edges.push(
      createEdge(moreServiceNode.id, streamNode.id, "", {
        numbered: true,
        dashed: true,
      }),
    );
    edges.push(
      createEdge(streamNode.id, s3Node.id, "", {
        numbered: true,
        dashed: true,
      }),
    );
    edges.push(
      createEdge(streamNode.id, hadoopNode.id, "", {
        numbered: true,
        dashed: true,
      }),
    );
    edges.push(
      createEdge(streamNode.id, elasticNode.id, "", {
        numbered: true,
        dashed: true,
      }),
    );

    // 7. Kafka consumers
    edges.push(
      createEdge(streamNode.id, kafkaConsumerNode.id, "", {
        numbered: true,
        dashed: true,
      }),
    );
    edges.push(
      createEdge(streamNode.id, sparkNode.id, "", {
        numbered: true,
        dashed: true,
      }),
    );
    edges.push(
      createEdge(sparkNode.id, searchKafkaNode.id, "", {
        numbered: true,
        dashed: true,
      }),
    );
    edges.push(
      createEdge(searchKafkaNode.id, elasticNode.id, "", {
        numbered: true,
        dashed: true,
      }),
    );

    this.log(
      `✅ Netflix-style architecture: ${nodes.length} nodes, ${edges.length} edges`,
    );

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        architecture: {
          type: "Microservices Architecture",
          description:
            "Netflix-style distributed system with horizontal layout",
          technologies: repoData.architecture?.technologies || [
            "React",
            "Node.js",
            "PostgreSQL",
            "Redis",
            "Kafka",
            "Spark",
            "Elasticsearch",
          ],
          infrastructure: repoData.architecture?.infrastructure || [
            "AWS",
            "Docker",
            "Kubernetes",
          ],
        },
      },
    };
  }

  generateAdaptiveDiagram(repoData, mcpAnalysis = null) {
    const nodes = [];
    const edges = [];
    let nodeId = 0;

    // Helper to create node
    const createNode = (label, type, position, metadata = {}) => ({
      id: `node-${nodeId++}`,
      type: "default",
      data: {
        label,
        nodeType: type,
        ...metadata,
      },
      position,
      style: {
        ...this.getNodeStyle(type),
        width: metadata.width || 180,
        height: metadata.height || 60,
      },
      width: metadata.width || 180,
      height: metadata.height || 60,
    });

    // Helper to create edge
    const createEdge = (source, target, label = "") => ({
      id: `edge-${source}-${target}`,
      source,
      target,
      label,
      animated: true,
      style: { stroke: "#64748b", strokeWidth: 2 },
    });

    // Analyze repository
    const analysis = this.analyzeRepository(repoData, mcpAnalysis);

    // Determine architecture type and generate appropriate diagram
    if (analysis.hasMicroservices) {
      return this.generateMicroservicesDiagram(
        analysis,
        createNode,
        createEdge,
        nodes,
        edges,
      );
    } else if (analysis.hasMultipleServers) {
      return this.generateMultiServerDiagram(
        analysis,
        createNode,
        createEdge,
        nodes,
        edges,
      );
    } else {
      return this.generateLayeredDiagram(
        analysis,
        createNode,
        createEdge,
        nodes,
        edges,
      );
    }
  }

  generateFileDependencyDiagram(repoData, mcpAnalysis = null) {
    this.log("🗂️  Generating application flow diagram...");

    const nodes = [];
    const edges = [];
    let nodeId = 0;

    // Helper to create node
    const createNode = (label, type, position, metadata = {}) => ({
      id: `node-${nodeId++}`,
      type: "default",
      data: {
        label,
        nodeType: type,
        ...metadata,
      },
      position,
      style: {
        ...this.getNodeStyle(type),
        width: metadata.width || 200,
        height: metadata.height || 60,
      },
      width: metadata.width || 200,
      height: metadata.height || 60,
    });

    // Helper to create edge
    const createEdge = (source, target, label = "") => ({
      id: `edge-${source}-${target}`,
      source,
      target,
      label,
      animated: true,
      style: { stroke: "#64748b", strokeWidth: 2 },
    });

    // Build detailed application flow with method-level relationships
    const relationships = repoData.relationships || [];
    const layers = repoData.architecture?.layers || {};

    // Check if we have any components to display
    const hasComponents =
      (layers.controllers && layers.controllers.length > 0) ||
      (layers.services && layers.services.length > 0) ||
      (layers.repositories && layers.repositories.length > 0);

    if (!hasComponents) {
      this.log(
        "⚠️  No application components found, falling back to layered diagram",
      );
      return this.generateAdaptiveDiagram(repoData, mcpAnalysis);
    }
    const nodeMap = new Map();

    // Group relationships by type
    const endpoints = relationships.filter((r) => r.type === "http_endpoint");
    const autowired = relationships.filter((r) => r.type === "autowired");
    const methodCalls = relationships.filter((r) => r.type === "method_call");

    let yPos = 100;
    const ySpacing = 200;
    const xCenter = 600;
    const componentSpacing = 350;

    // Layer 1: HTTP Endpoints (Entry points) - Limit to 3 to avoid crowding
    const endpointNodes = [];
    const uniqueEndpoints = [
      ...new Map(endpoints.map((e) => [e.endpoint, e])).values(),
    ];

    if (uniqueEndpoints.length > 0) {
      const displayEndpoints = uniqueEndpoints.slice(0, 3);
      const startX =
        xCenter - ((displayEndpoints.length - 1) * componentSpacing) / 2;

      displayEndpoints.forEach((ep, idx) => {
        const node = createNode(
          `${ep.endpoint}`,
          "client",
          {
            x: startX + idx * componentSpacing,
            y: yPos,
          },
          {
            endpoint: ep.endpoint,
            controller: ep.targetClass,
            description: `HTTP ${ep.endpoint}`,
          },
        );
        nodes.push(node);
        endpointNodes.push({ node, target: ep.target });
        nodeMap.set(`endpoint-${ep.endpoint}`, node.id);
      });
      yPos += ySpacing;
    }

    // Layer 2: Controllers
    const controllers = layers.controllers || [];
    const controllerNodes = [];

    if (controllers.length > 0) {
      const displayControllers = controllers.slice(0, 4); // Limit to 4
      const startX =
        xCenter - ((displayControllers.length - 1) * componentSpacing) / 2;

      displayControllers.forEach((controller, idx) => {
        const controllerPath = repoData.files?.find(
          (f) => f.name === `${controller}.java`,
        )?.path;

        const node = createNode(
          controller.replace("Controller", ""),
          "backend",
          {
            x: startX + idx * componentSpacing,
            y: yPos,
          },
          {
            fullName: controller,
            path: controllerPath,
          },
        );
        nodes.push(node);
        controllerNodes.push({ node, path: controllerPath, name: controller });
        nodeMap.set(controllerPath, node.id);

        // Connect endpoints to controllers
        endpointNodes.forEach((ep) => {
          if (ep.target === controllerPath) {
            edges.push(createEdge(ep.node.id, node.id, "HTTP"));
          }
        });
      });
      yPos += ySpacing;
    }

    // Layer 3: Services (with autowired connections)
    const services = layers.services || [];
    const serviceNodes = [];

    if (services.length > 0) {
      const displayServices = services.slice(0, 4); // Limit to 4
      const startX =
        xCenter - ((displayServices.length - 1) * componentSpacing) / 2;

      displayServices.forEach((service, idx) => {
        const servicePath = repoData.files?.find(
          (f) => f.name === `${service}.java`,
        )?.path;

        const node = createNode(
          service.replace("Service", "").replace("Impl", ""),
          "microservice",
          {
            x: startX + idx * componentSpacing,
            y: yPos,
          },
          {
            fullName: service,
            path: servicePath,
          },
        );
        nodes.push(node);
        serviceNodes.push({ node, path: servicePath, name: service });
        nodeMap.set(servicePath, node.id);

        // Connect controllers to services based on @Autowired
        autowired.forEach((aw) => {
          const controllerNode = controllerNodes.find(
            (c) => c.path === aw.source,
          );
          if (controllerNode && aw.target === service) {
            edges.push(
              createEdge(controllerNode.node.id, node.id, `@Autowired`),
            );
          }
        });
      });
      yPos += ySpacing;
    }

    // Layer 4: Repositories
    const repositories = layers.repositories || [];
    const repoNodes = [];

    if (repositories.length > 0) {
      const displayRepos = repositories.slice(0, 4); // Limit to 4
      const startX =
        xCenter - ((displayRepos.length - 1) * componentSpacing) / 2;

      displayRepos.forEach((repo, idx) => {
        const repoPath = repoData.files?.find(
          (f) => f.name === `${repo}.java`,
        )?.path;

        const node = createNode(
          repo.replace("Repository", "").replace("Repo", ""),
          "database",
          {
            x: startX + idx * componentSpacing,
            y: yPos,
          },
          {
            fullName: repo,
            path: repoPath,
          },
        );
        nodes.push(node);
        repoNodes.push({ node, path: repoPath, name: repo });
        nodeMap.set(repoPath, node.id);

        // Connect services to repositories based on @Autowired
        autowired.forEach((aw) => {
          const serviceNode = serviceNodes.find((s) => s.path === aw.source);
          if (serviceNode && aw.target === repo) {
            edges.push(createEdge(serviceNode.node.id, node.id, `@Autowired`));
          }
        });
      });
      yPos += ySpacing;
    }

    // Layer 5: Database
    const databases =
      repoData.architecture?.components?.filter((c) => c.type === "database") ||
      [];
    if (databases.length > 0 || repoNodes.length > 0) {
      const dbNode = createNode(
        databases[0]?.technologies?.[0] || "Database",
        "database",
        {
          x: xCenter,
          y: yPos,
        },
      );
      nodes.push(dbNode);

      // Connect repositories to database
      repoNodes.forEach((rn) => {
        edges.push(createEdge(rn.node.id, dbNode.id, "JPA/SQL"));
      });
    }

    this.log(
      `✅ Application flow diagram: ${nodes.length} components, ${edges.length} connections`,
    );

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        architecture: {
          type: "Application Flow Diagram",
          description:
            "Request flow from user through controllers, services, repositories to database",
          technologies: repoData.architecture?.technologies || [],
          infrastructure: repoData.architecture?.infrastructure || [],
        },
      },
    };
  }

  getFileNodeType(fileType) {
    const typeMap = {
      controller: "backend",
      service: "microservice",
      repository: "database",
      model: "database",
      config: "config",
      route: "backend",
      middleware: "backend",
      util: "utility",
      helper: "utility",
    };
    return typeMap[fileType] || "default";
  }

  analyzeRepository(repoData, mcpAnalysis) {
    const isJava = this.isJavaProject(repoData);
    const microservices = this.detectMicroservices(repoData);
    const databases = this.detectDatabases(repoData);
    const hasCache = this.detectCache(repoData);
    const hasMessageQueue = this.detectMessageQueue(repoData);
    const frontendFramework = this.getFrontendFramework(repoData, isJava);
    const backendFramework = this.getBackendFramework(repoData, isJava);
    const infrastructure = this.detectInfrastructure(repoData);

    // PRIORITY 1: Use MCP analysis data if available
    let layers = {};
    if (mcpAnalysis && mcpAnalysis.components) {
      this.log("🤖 Using MCP-analyzed components");
      layers = {
        controllers:
          mcpAnalysis.components.controllers?.map(
            (c) => c.name || c.description,
          ) || [],
        services:
          mcpAnalysis.components.services?.map(
            (c) => c.name || c.description,
          ) || [],
        repositories:
          mcpAnalysis.components.repositories?.map(
            (c) => c.name || c.description,
          ) || [],
      };

      this.log("📊 MCP Layers:", {
        controllers: layers.controllers.length,
        services: layers.services.length,
        repositories: layers.repositories.length,
      });
    } else {
      // PRIORITY 2: Use deep analysis layers from GitHub scan
      this.log("📂 Using GitHub-scanned layers");
      layers = repoData.architecture?.layers || {};
    }

    // Detect admin components
    const hasAdmin = repoData.files?.some(
      (f) =>
        f.name.toLowerCase().includes("admin") ||
        f.name.toLowerCase().includes("management") ||
        f.path?.toLowerCase().includes("admin"),
    );

    // Detect background workers
    const hasWorkers = repoData.files?.some(
      (f) =>
        f.name.toLowerCase().includes("worker") ||
        f.name.toLowerCase().includes("job") ||
        f.name.toLowerCase().includes("queue") ||
        f.path?.toLowerCase().includes("workers"),
    );

    return {
      isJava,
      frontendFramework,
      backendFramework,
      databases,
      hasCache,
      hasMessageQueue,
      microservices,
      hasMicroservices: microservices.length > 0,
      hasAdmin,
      hasWorkers,
      hasMultipleServers: hasAdmin || hasWorkers || hasMessageQueue,
      infrastructure,
      technologies: this.extractTechnologies(repoData, mcpAnalysis),
      layers, // Prioritize MCP layers, fallback to GitHub scan
      mcpDataUsed: !!(mcpAnalysis && mcpAnalysis.components),
    };
  }

  generateLayeredDiagram(analysis, createNode, createEdge, nodes, edges) {
    let yPos = 50;
    const xCenter = 400;
    const ySpacing = 100;
    const componentSpacing = 220;

    this.log("🎨 Generating layered diagram with detected components:");
    this.log(
      "   Data Source:",
      analysis.mcpDataUsed ? "🤖 MCP Analysis" : "📂 GitHub Scan",
    );
    this.log("   Controllers:", analysis.layers?.controllers?.length || 0);
    this.log("   Services:", analysis.layers?.services?.length || 0);
    this.log("   Repositories:", analysis.layers?.repositories?.length || 0);

    // Layer 1: Client
    const clientNode = createNode("Client/API Consumer", "client", {
      x: xCenter,
      y: yPos,
    });
    nodes.push(clientNode);
    yPos += ySpacing;

    // Layer 2: Frontend (if exists)
    let frontendNode = null;
    if (analysis.frontendFramework && analysis.frontendFramework !== "Web UI") {
      frontendNode = createNode(
        `${analysis.frontendFramework} UI`,
        "frontend",
        {
          x: xCenter,
          y: yPos,
        },
      );
      nodes.push(frontendNode);
      edges.push(createEdge(clientNode.id, frontendNode.id, "HTTPS"));
      yPos += ySpacing;
    }

    // Layer 3: Controllers (ACTUAL DETECTED CONTROLLERS)
    const controllerNodes = [];
    if (
      analysis.layers?.controllers &&
      analysis.layers.controllers.length > 0
    ) {
      const controllers = analysis.layers.controllers; // Show ALL controllers
      const controllerStartX =
        xCenter - ((controllers.length - 1) * componentSpacing) / 2;

      console.log(`   📍 Displaying ${controllers.length} controllers`);
      controllers.forEach((controller, idx) => {
        const controllerNode = createNode(controller, "backend", {
          x: controllerStartX + idx * componentSpacing,
          y: yPos,
        });
        nodes.push(controllerNode);
        controllerNodes.push(controllerNode);

        const sourceNode = frontendNode || clientNode;
        edges.push(createEdge(sourceNode.id, controllerNode.id, "REST"));
      });
      yPos += ySpacing;
    } else {
      // Fallback if no controllers detected
      const backendNode = createNode(
        `${analysis.backendFramework} API`,
        "backend",
        {
          x: xCenter,
          y: yPos,
        },
      );
      nodes.push(backendNode);
      controllerNodes.push(backendNode);

      const sourceNode = frontendNode || clientNode;
      edges.push(createEdge(sourceNode.id, backendNode.id, "HTTP"));
      yPos += ySpacing;
    }

    // Layer 4: Services (ACTUAL DETECTED SERVICES)
    const serviceNodes = [];
    if (analysis.layers?.services && analysis.layers.services.length > 0) {
      const services = analysis.layers.services; // Show ALL services
      const serviceStartX =
        xCenter - ((services.length - 1) * componentSpacing) / 2;

      console.log(`   📍 Displaying ${services.length} services`);
      services.forEach((service, idx) => {
        const serviceNode = createNode(service, "microservice", {
          x: serviceStartX + idx * componentSpacing,
          y: yPos,
        });
        nodes.push(serviceNode);
        serviceNodes.push(serviceNode);

        // Connect controllers to services
        controllerNodes.forEach((cn) => {
          edges.push(createEdge(cn.id, serviceNode.id, "Call"));
        });
      });
      yPos += ySpacing;
    }

    // Layer 5: Repositories (ACTUAL DETECTED REPOSITORIES)
    const repoNodes = [];
    if (
      analysis.layers?.repositories &&
      analysis.layers.repositories.length > 0
    ) {
      const repositories = analysis.layers.repositories; // Show ALL repositories
      const repoStartX =
        xCenter - ((repositories.length - 1) * componentSpacing) / 2;

      console.log(`   📍 Displaying ${repositories.length} repositories`);
      repositories.forEach((repo, idx) => {
        const repoNode = createNode(repo, "database", {
          x: repoStartX + idx * componentSpacing,
          y: yPos,
        });
        nodes.push(repoNode);
        repoNodes.push(repoNode);

        // Connect services to repositories
        const sourceNodes =
          serviceNodes.length > 0 ? serviceNodes : controllerNodes;
        sourceNodes.forEach((sn) => {
          edges.push(createEdge(sn.id, repoNode.id, "Data"));
        });
      });
      yPos += ySpacing;
    }

    // Layer 6: Cache (if exists)
    if (analysis.hasCache) {
      const cacheNode = createNode("Redis Cache", "cache", {
        x: xCenter - 250,
        y: yPos,
      });
      nodes.push(cacheNode);
      const sourceNodes =
        serviceNodes.length > 0 ? serviceNodes : controllerNodes;
      if (sourceNodes.length > 0) {
        edges.push(createEdge(sourceNodes[0].id, cacheNode.id, "Cache"));
      }
    }

    // Layer 7: Databases
    const dbStartX =
      analysis.databases.length > 1
        ? xCenter - (analysis.databases.length - 1) * 110
        : xCenter;

    analysis.databases.forEach((db, idx) => {
      const dbNode = createNode(db.name, "database", {
        x: dbStartX + idx * componentSpacing,
        y: yPos,
      });
      nodes.push(dbNode);

      // Connect repositories or services to databases
      const sourceNodes =
        repoNodes.length > 0
          ? repoNodes
          : serviceNodes.length > 0
            ? serviceNodes
            : controllerNodes;
      sourceNodes.forEach((sn) => {
        edges.push(createEdge(sn.id, dbNode.id, "Query"));
      });
    });
    yPos += ySpacing;

    // Layer 8: Infrastructure
    if (analysis.infrastructure.length > 0) {
      const infraStartX = xCenter - (analysis.infrastructure.length - 1) * 110;
      analysis.infrastructure.forEach((infra, idx) => {
        const infraNode = createNode(infra, "infrastructure", {
          x: infraStartX + idx * componentSpacing,
          y: yPos,
        });
        nodes.push(infraNode);
      });
    }

    this.log(
      `✅ Generated diagram with ${nodes.length} nodes and ${edges.length} edges`,
    );

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        dataSource: analysis.mcpDataUsed ? "MCP Analysis" : "GitHub Scan",
        architecture: {
          type: "Layered Architecture",
          components: nodes.length,
          technologies: analysis.technologies,
          infrastructure: analysis.infrastructure,
          layers: analysis.layers,
        },
        mcpEnhanced: analysis.mcpDataUsed || false,
      },
    };
  }

  generateMicroservicesDiagram(analysis, createNode, createEdge, nodes, edges) {
    let yPos = 50;
    const xCenter = 400;
    const ySpacing = 120;

    // Layer 1: Client
    const clientNode = createNode("Client", "client", { x: xCenter, y: yPos });
    nodes.push(clientNode);
    yPos += ySpacing;

    // Layer 2: Frontend
    let frontendNode = null;
    if (analysis.frontendFramework && analysis.frontendFramework !== "Web UI") {
      frontendNode = createNode(`${analysis.frontendFramework}`, "frontend", {
        x: xCenter,
        y: yPos,
      });
      nodes.push(frontendNode);
      edges.push(createEdge(clientNode.id, frontendNode.id, "HTTPS"));
      yPos += ySpacing;
    }

    // Layer 3: API Gateway
    const gatewayNode = createNode("API Gateway", "gateway", {
      x: xCenter,
      y: yPos,
    });
    nodes.push(gatewayNode);

    if (frontendNode) {
      edges.push(createEdge(frontendNode.id, gatewayNode.id, "REST"));
    } else {
      edges.push(createEdge(clientNode.id, gatewayNode.id, "HTTP"));
    }
    yPos += ySpacing;

    // Layer 4: Microservices
    const serviceCount = Math.min(analysis.microservices.length, 4);
    const serviceStartX = xCenter - (serviceCount - 1) * 110;

    const serviceNodes = [];
    analysis.microservices.slice(0, serviceCount).forEach((service, idx) => {
      const serviceNode = createNode(service.name, "microservice", {
        x: serviceStartX + idx * 220,
        y: yPos,
      });
      nodes.push(serviceNode);
      serviceNodes.push(serviceNode);
      edges.push(createEdge(gatewayNode.id, serviceNode.id, "Route"));
    });
    yPos += ySpacing;

    // Layer 5: Message Queue (if exists)
    if (analysis.hasMessageQueue) {
      const queueNode = createNode("Message Queue", "messagequeue", {
        x: xCenter,
        y: yPos,
      });
      nodes.push(queueNode);
      serviceNodes.forEach((sn) => {
        edges.push(createEdge(sn.id, queueNode.id, "Publish"));
      });
      yPos += ySpacing;
    }

    // Layer 6: Databases (one per service)
    const dbStartX = xCenter - (serviceCount - 1) * 110;
    serviceNodes.forEach((serviceNode, idx) => {
      const dbName = analysis.databases[idx]?.name || `DB ${idx + 1}`;
      const dbNode = createNode(dbName, "database", {
        x: dbStartX + idx * 220,
        y: yPos,
      });
      nodes.push(dbNode);
      edges.push(createEdge(serviceNode.id, dbNode.id, "Query"));
    });
    yPos += ySpacing;

    // Layer 7: Infrastructure
    if (analysis.infrastructure.length > 0) {
      const infraStartX = xCenter - (analysis.infrastructure.length - 1) * 110;
      analysis.infrastructure.forEach((infra, idx) => {
        const infraNode = createNode(infra, "infrastructure", {
          x: infraStartX + idx * 220,
          y: yPos,
        });
        nodes.push(infraNode);
      });
    }

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        architecture: {
          type: "Microservices Architecture",
          components: nodes.length,
          technologies: analysis.technologies,
          infrastructure: analysis.infrastructure,
        },
        mcpEnhanced: false,
      },
    };
  }

  generateMultiServerDiagram(analysis, createNode, createEdge, nodes, edges) {
    const layout = {
      serverWidth: 280,
      componentWidth: 160,
      componentHeight: 50,
      xSpacing: 320,
      ySpacing: 15,
    };

    let xPos = 50;
    const yStart = 50;
    const allServerNodes = [];

    // Determine which servers to show
    const servers = [];

    // Admin Server (if detected)
    if (analysis.hasAdmin) {
      servers.push({
        name: "Administration Tool",
        type: "admin",
        components: [
          { name: "Management", type: "admin" },
          { name: "API Documentation", type: "admin" },
          { name: "Configuration", type: "admin" },
        ],
      });
    }

    // Main Application Server
    const mainComponents = [];
    if (analysis.frontendFramework && analysis.frontendFramework !== "Web UI") {
      mainComponents.push({
        name: `${analysis.frontendFramework} UI`,
        type: "frontend",
      });
    }
    mainComponents.push({
      name: `${analysis.backendFramework} API`,
      type: "backend",
    });
    if (analysis.isJava) {
      mainComponents.push({ name: "Service Layer", type: "microservice" });
    }

    servers.push({
      name: analysis.isJava
        ? `${analysis.backendFramework} Server`
        : "Application Server",
      type: "main",
      components: mainComponents,
      databases: analysis.databases,
    });

    // Worker/Generator Server (if detected)
    if (analysis.hasWorkers || analysis.hasMessageQueue) {
      servers.push({
        name: analysis.hasMessageQueue ? "Generator Server" : "Worker Server",
        type: "worker",
        components: [
          { name: "Background Jobs", type: "microservice" },
          { name: "Data Processing", type: "microservice" },
          { name: "Analytics", type: "microservice" },
        ],
      });
    }

    // Render servers
    servers.forEach((server, serverIdx) => {
      const serverX = xPos;
      let serverY = yStart;

      // Server Header
      const headerNode = createNode(
        server.name,
        "server-header",
        {
          x: serverX,
          y: serverY,
        },
        { width: layout.serverWidth, height: 50 },
      );
      nodes.push(headerNode);
      serverY += 70;

      const serverNodes = [];

      // Components
      server.components.forEach((comp) => {
        const node = createNode(
          comp.name,
          comp.type,
          {
            x: serverX + (layout.serverWidth - layout.componentWidth) / 2,
            y: serverY,
          },
          { width: layout.componentWidth, height: layout.componentHeight },
        );
        nodes.push(node);
        serverNodes.push(node);
        serverY += layout.componentHeight + layout.ySpacing;
      });

      // Databases (for main server)
      if (server.databases && server.databases.length > 0) {
        serverY += 20;
        const dbLayerNode = createNode(
          "Database Layer",
          "layer-header",
          {
            x: serverX + (layout.serverWidth - layout.componentWidth) / 2,
            y: serverY,
          },
          { width: layout.componentWidth, height: 40 },
        );
        nodes.push(dbLayerNode);
        serverY += 55;

        server.databases.forEach((db) => {
          const dbNode = createNode(
            db.name,
            "database",
            {
              x: serverX + (layout.serverWidth - layout.componentWidth) / 2,
              y: serverY,
            },
            { width: layout.componentWidth, height: layout.componentHeight },
          );
          nodes.push(dbNode);

          // Connect services to databases
          serverNodes.forEach((sn) => {
            if (
              sn.data.nodeType === "backend" ||
              sn.data.nodeType === "microservice"
            ) {
              edges.push(createEdge(sn.id, dbNode.id, ""));
            }
          });

          serverY += layout.componentHeight + layout.ySpacing;
        });
      }

      allServerNodes.push({ server, nodes: serverNodes });
      xPos += layout.serverWidth + layout.xSpacing;
    });

    // Create cross-server connections
    if (allServerNodes.length >= 2) {
      // Admin to Main
      if (
        allServerNodes[0].server.type === "admin" &&
        allServerNodes[1].server.type === "main"
      ) {
        edges.push(
          createEdge(
            allServerNodes[0].nodes[0].id,
            allServerNodes[1].nodes[0].id,
            "API",
          ),
        );
      }

      // Main to Worker
      if (allServerNodes.length >= 3) {
        const mainNodes = allServerNodes[1].nodes;
        const workerNodes = allServerNodes[2].nodes;
        if (mainNodes.length > 0 && workerNodes.length > 0) {
          const label = analysis.hasMessageQueue ? "Queue" : "Task";
          edges.push(
            createEdge(
              mainNodes[mainNodes.length - 1].id,
              workerNodes[0].id,
              label,
            ),
          );
        }
      }
    }

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        architecture: {
          type: "Multi-Server Architecture",
          components: nodes.length,
          technologies: analysis.technologies,
          infrastructure: analysis.infrastructure,
        },
        mcpEnhanced: false,
      },
    };
  }

  extractFrontendComponents(repoData, mcpAnalysis) {
    const components = [];

    // From MCP analysis
    if (mcpAnalysis) {
      const mcpInsights = this.parseMCPAnalysis(mcpAnalysis.analysis);
      if (mcpInsights.frontend) {
        components.push({
          name: `${mcpInsights.frontend} App`,
          type: "frontend",
        });
      }
    }

    // From repository architecture
    if (repoData.architecture?.components) {
      const frontendComp = repoData.architecture.components.find(
        (c) => c.type === "frontend",
      );
      if (frontendComp && frontendComp.framework) {
        if (components.length === 0) {
          components.push({
            name: `${frontendComp.framework} App`,
            type: "frontend",
          });
        }
      }
    }

    // Add common frontend components
    if (components.length > 0) {
      return [
        { name: "Login Page", type: "frontend" },
        { name: "Dashboard", type: "frontend" },
        { name: "User Profile", type: "frontend" },
      ];
    }

    // Default
    return [{ name: "Web UI", type: "frontend" }];
  }

  extractBackendServices(repoData, mcpAnalysis) {
    const services = [];

    // Check for Spring Boot (Java)
    if (repoData.language === "Java") {
      return [
        { name: "Auth Controller", type: "backend" },
        { name: "User Controller", type: "backend" },
        { name: "Data Controller", type: "backend" },
      ];
    }

    // Check for Node.js/Express
    if (repoData.packageInfo?.dependencies?.includes("express")) {
      return [
        { name: "Auth API", type: "backend" },
        { name: "User API", type: "backend" },
        { name: "Data API", type: "backend" },
      ];
    }

    // Check for Python/Django
    if (repoData.language === "Python") {
      return [
        { name: "Auth View", type: "backend" },
        { name: "User View", type: "backend" },
        { name: "Data View", type: "backend" },
      ];
    }

    // Check for Go
    if (repoData.language === "Go") {
      return [
        { name: "Auth Handler", type: "backend" },
        { name: "User Handler", type: "backend" },
        { name: "Data Handler", type: "backend" },
      ];
    }

    // Default for any other language
    return [
      { name: "Auth Service", type: "backend" },
      { name: "User Service", type: "backend" },
      { name: "Data Service", type: "backend" },
    ];
  }

  extractBusinessServices(repoData) {
    // Check for Spring Boot
    if (repoData.language === "Java") {
      return [
        { name: "Auth Service", type: "service" },
        { name: "User Service", type: "service" },
        { name: "Business Logic", type: "service" },
      ];
    }

    // Check for microservices indicators
    if (repoData.files?.some((f) => f.name.includes("docker-compose"))) {
      return [
        { name: "User Service", type: "service" },
        { name: "Order Service", type: "service" },
        { name: "Payment Service", type: "service" },
      ];
    }

    // For Node.js/Express with multiple services
    if (repoData.packageInfo?.dependencies?.includes("express")) {
      return [
        { name: "Auth Service", type: "service" },
        { name: "User Service", type: "service" },
        { name: "Data Service", type: "service" },
      ];
    }

    return [];
  }

  extractDatabaseModels(repoData) {
    // Check for Spring Boot/JPA
    if (repoData.language === "Java") {
      return [
        { name: "Users Table", type: "database" },
        { name: "Data Table", type: "database" },
        { name: "Sessions Table", type: "database" },
      ];
    }

    // Check for MongoDB
    if (repoData.packageInfo?.dependencies?.includes("mongoose")) {
      return [
        { name: "Users Collection", type: "database" },
        { name: "Data Collection", type: "database" },
        { name: "Sessions Collection", type: "database" },
      ];
    }

    // Check for PostgreSQL/MySQL
    if (
      repoData.packageInfo?.dependencies?.includes("pg") ||
      repoData.packageInfo?.dependencies?.includes("mysql")
    ) {
      return [
        { name: "Users Table", type: "database" },
        { name: "Data Table", type: "database" },
        { name: "Sessions Table", type: "database" },
      ];
    }

    // Default for any database
    return [
      { name: "Users Table", type: "database" },
      { name: "Data Table", type: "database" },
    ];
  }

  extractTechnologies(repoData, mcpAnalysis) {
    const technologies = new Set();

    // From MCP
    if (mcpAnalysis) {
      const mcpInsights = this.parseMCPAnalysis(mcpAnalysis.analysis);
      if (mcpInsights.frontend) technologies.add(mcpInsights.frontend);
      if (mcpInsights.backend) technologies.add(mcpInsights.backend);
      mcpInsights.databases.forEach((db) => technologies.add(db.name || db));
    }

    // From repo data
    if (repoData.language) technologies.add(repoData.language);
    if (repoData.architecture?.components) {
      repoData.architecture.components.forEach((comp) => {
        if (comp.framework) technologies.add(comp.framework);
        if (comp.technologies)
          comp.technologies.forEach((t) => technologies.add(t));
      });
    }

    return Array.from(technologies);
  }

  determineDetailedArchitectureType(
    repoData,
    frontendComponents,
    backendServices,
  ) {
    if (backendServices.length > 2 && frontendComponents.length > 1) {
      return "Microservices Architecture";
    }
    if (frontendComponents.length > 0 && backendServices.length > 0) {
      return "Full-Stack Application";
    }
    return "Monolithic Application";
  }

  generateMCPEnhancedDiagram(repoData, mcpAnalysis) {
    // Generate nodes and edges for React Flow using MCP insights
    const nodes = [];
    const edges = [];
    let yPosition = 0;
    let nodeId = 0;

    // Helper to create node
    const createNode = (label, type, position) => ({
      id: `node-${nodeId++}`,
      type: "default",
      data: {
        label,
        nodeType: type,
      },
      position,
      style: {
        ...this.getNodeStyle(type),
        width: 180,
        height: 60,
      },
      width: 180,
      height: 60,
    });

    // Helper to create edge
    const createEdge = (source, target, label = "") => ({
      id: `edge-${source}-${target}`,
      source,
      target,
      label,
      animated: true,
      style: { stroke: "#64748b" },
    });

    // Parse MCP analysis to extract architecture components
    const mcpInsights = this.parseMCPAnalysis(mcpAnalysis.analysis);

    // Layer 1: Client
    const clientNode = createNode("Client", "client", { x: 400, y: yPosition });
    nodes.push(clientNode);
    yPosition += 150;

    // Layer 2: Frontend (if detected)
    let frontendNode = null;
    if (mcpInsights.frontend) {
      frontendNode = createNode(mcpInsights.frontend, "frontend", {
        x: 400,
        y: yPosition,
      });
      nodes.push(frontendNode);
      edges.push(createEdge(clientNode.id, frontendNode.id, "HTTPS"));
      yPosition += 150;
    }

    // Layer 3: API Gateway
    const gatewayNode = createNode("API Gateway", "gateway", {
      x: 400,
      y: yPosition,
    });
    nodes.push(gatewayNode);

    if (frontendNode) {
      edges.push(createEdge(frontendNode.id, gatewayNode.id, "REST API"));
    } else {
      edges.push(createEdge(clientNode.id, gatewayNode.id, "HTTP"));
    }
    yPosition += 150;

    // Layer 4: Microservices
    const microservices = mcpInsights.microservices || [];
    const serviceNodes = [];

    if (microservices.length > 0) {
      const serviceStartX = 400 - (microservices.length - 1) * 110;
      microservices.forEach((service, idx) => {
        const serviceNode = createNode(service.name, "microservice", {
          x: serviceStartX + idx * 220,
          y: yPosition,
        });
        nodes.push(serviceNode);
        serviceNodes.push(serviceNode);
        edges.push(createEdge(gatewayNode.id, serviceNode.id, "Route"));
      });
      yPosition += 150;
    }

    // Layer 5: Databases
    const databases = mcpInsights.databases || [];
    if (databases.length > 0) {
      const dbStartX = 400 - (databases.length - 1) * 110;
      databases.forEach((db, idx) => {
        const dbNode = createNode(db.name || db, "database", {
          x: dbStartX + idx * 220,
          y: yPosition,
        });
        nodes.push(dbNode);

        // Connect services to databases
        serviceNodes.forEach((sn) => {
          edges.push(createEdge(sn.id, dbNode.id, "Query"));
        });
      });
      yPosition += 150;
    }

    // Layer 6: Infrastructure
    const infrastructure = this.detectInfrastructure(repoData);
    if (infrastructure.length > 0) {
      const infraStartX = 400 - (infrastructure.length - 1) * 110;
      infrastructure.forEach((infra, idx) => {
        const infraNode = createNode(infra, "infrastructure", {
          x: infraStartX + idx * 220,
          y: yPosition,
        });
        nodes.push(infraNode);
      });
    }

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        architecture: {
          type: "MCP-Enhanced Architecture",
          components: nodes.length,
          technologies: this.extractTechnologies(repoData, mcpAnalysis),
          infrastructure,
        },
        mcpEnhanced: true,
      },
    };
  }

  parseMCPAnalysis(analysis) {
    // Parse MCP analysis text to extract structured data
    const insights = {
      frontend: null,
      backend: null,
      databases: [],
      microservices: [],
      infrastructure: [],
    };

    if (!analysis) return insights;

    const text =
      typeof analysis === "string" ? analysis : JSON.stringify(analysis);

    // Extract frontend framework
    if (text.match(/React|Angular|Vue/i)) {
      const match = text.match(/(React|Angular|Vue)/i);
      if (match) insights.frontend = match[1];
    }

    // Extract backend framework
    if (text.match(/Express|Spring Boot|Django|Flask/i)) {
      const match = text.match(/(Express|Spring Boot|Django|Flask)/i);
      if (match) insights.backend = match[1];
    }

    // Extract databases
    const dbPatterns = [
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "Cassandra",
      "DynamoDB",
    ];
    dbPatterns.forEach((db) => {
      if (text.includes(db)) {
        insights.databases.push({ name: db, type: "database" });
      }
    });

    // Extract microservices
    const servicePattern = /(\w+)\s+Service/gi;
    let match;
    while ((match = servicePattern.exec(text)) !== null) {
      insights.microservices.push({
        name: `${match[1]} Service`,
        type: "microservice",
      });
    }

    return insights;
  }

  generateBasicDiagram(repoData) {
    // Fallback basic diagram
    const nodes = [];
    const edges = [];
    let nodeId = 0;

    const createNode = (label, type, x, y) => ({
      id: `node-${nodeId++}`,
      type: "default",
      data: { label, nodeType: type },
      position: { x, y },
      style: { ...this.getNodeStyle(type), width: 180, height: 60 },
      width: 180,
      height: 60,
    });

    const createEdge = (source, target, label = "") => ({
      id: `edge-${source}-${target}`,
      source,
      target,
      label,
      animated: true,
      style: { stroke: "#64748b" },
    });

    // Simple 3-layer architecture
    const clientNode = createNode("Client", "client", 400, 50);
    nodes.push(clientNode);

    const backendNode = createNode("Backend", "backend", 400, 200);
    nodes.push(backendNode);
    edges.push(createEdge(clientNode.id, backendNode.id, "HTTP"));

    const dbNode = createNode("Database", "database", 400, 350);
    nodes.push(dbNode);
    edges.push(createEdge(backendNode.id, dbNode.id, "Query"));

    // Add detected services
    const services = this.detectMicroservices(repoData);
    if (services.length > 0) {
      const serviceStartX = 400 - (services.length - 1) * 110;
      services.forEach((service, idx) => {
        const serviceNode = createNode(
          service.name,
          "microservice",
          serviceStartX + idx * 220,
          500,
        );
        nodes.push(serviceNode);
      });
    }

    // Add infrastructure
    const infrastructure = this.detectInfrastructure(repoData);
    if (infrastructure.length > 0) {
      const infraStartX = 400 - (infrastructure.length - 1) * 110;
      infrastructure.forEach((infra, idx) => {
        const infraNode = createNode(
          infra,
          "infrastructure",
          infraStartX + idx * 220,
          650,
        );
        nodes.push(infraNode);
      });
    }

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        architecture: {
          type: "Basic Architecture",
          components: nodes.length,
          technologies: repoData.architecture?.technologies || [],
          infrastructure,
        },
        mcpEnhanced: false,
      },
    };
  }

  getNodeStyle(type) {
    const baseStyle = {
      padding: "10px",
      borderRadius: "8px",
      border: "2px solid",
      color: "#fff",
      fontSize: "12px",
      fontWeight: "bold",
      textAlign: "center",
    };

    const styles = {
      "server-header": {
        ...baseStyle,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderColor: "#5a67d8",
        fontSize: "14px",
        fontWeight: "900",
      },
      "layer-header": {
        ...baseStyle,
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        borderColor: "#4299e1",
        fontSize: "11px",
        fontWeight: "600",
      },
      admin: {
        ...baseStyle,
        background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        borderColor: "#9f7aea",
        color: "#333",
      },
      client: {
        ...baseStyle,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderColor: "#5a67d8",
      },
      frontend: {
        ...baseStyle,
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        borderColor: "#ed64a6",
      },
      gateway: {
        ...baseStyle,
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        borderColor: "#4299e1",
      },
      backend: {
        ...baseStyle,
        background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        borderColor: "#48bb78",
      },
      microservice: {
        ...baseStyle,
        background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        borderColor: "#ed8936",
      },
      database: {
        ...baseStyle,
        background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
        borderColor: "#3182ce",
      },
      cache: {
        ...baseStyle,
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        borderColor: "#ed8936",
      },
      messagequeue: {
        ...baseStyle,
        background: "linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)",
        borderColor: "#6366f1",
      },
      infrastructure: {
        ...baseStyle,
        background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        borderColor: "#718096",
      },
    };

    return styles[type] || baseStyle;
  }

  isJavaProject(repoData) {
    // Check if this is a Java/Spring project
    const hasJavaFiles = repoData.files?.some(
      (f) =>
        f.name === "pom.xml" ||
        f.name === "build.gradle" ||
        f.name.includes(".java"),
    );
    const isSpring =
      repoData.name?.toLowerCase().includes("spring") ||
      repoData.description?.toLowerCase().includes("spring");
    return hasJavaFiles || isSpring || repoData.language === "Java";
  }

  getFrontendFramework(repoData, isJavaProject = false) {
    const frontend = repoData.architecture?.components?.find(
      (c) => c.type === "frontend",
    );
    if (frontend?.framework) return frontend.framework;
    if (isJavaProject) return "Thymeleaf/JSP";
    return "Web UI";
  }

  getBackendFramework(repoData, isJavaProject = false) {
    const backend = repoData.architecture?.components?.find(
      (c) => c.type === "backend",
    );
    if (backend?.framework) return backend.framework;
    if (isJavaProject) return "Spring Boot";
    if (repoData.language === "Python") return "Python/Flask";
    if (repoData.language === "Go") return "Go";
    return "Node.js";
  }

  detectMicroservices(repoData) {
    // Simple heuristic: if multiple services or docker-compose
    const hasDockerCompose = repoData.files?.some((f) =>
      f.name.includes("docker-compose"),
    );
    if (hasDockerCompose) {
      return [
        { name: "User Service", type: "microservice" },
        { name: "Order Service", type: "microservice" },
        { name: "Payment Service", type: "microservice" },
      ];
    }
    return [];
  }

  detectMessageQueue(repoData) {
    const deps = repoData.packageInfo?.dependencies || [];
    return deps.some(
      (dep) =>
        dep.includes("kafka") ||
        dep.includes("rabbitmq") ||
        dep.includes("redis") ||
        dep.includes("bull"),
    );
  }

  detectCache(repoData) {
    const deps = repoData.packageInfo?.dependencies || [];
    return deps.some(
      (dep) => dep.includes("redis") || dep.includes("memcached"),
    );
  }

  detectDatabases(repoData) {
    const databases = [];
    const deps = repoData.packageInfo?.dependencies || [];

    if (deps.includes("mongoose") || deps.includes("mongodb")) {
      databases.push({ name: "MongoDB", type: "database" });
    }
    if (deps.includes("pg") || deps.includes("postgres")) {
      databases.push({ name: "PostgreSQL", type: "database" });
    }
    if (deps.includes("mysql") || deps.includes("mysql2")) {
      databases.push({ name: "MySQL", type: "database" });
    }

    // Check for Java databases
    if (repoData.language === "Java") {
      const pomContent = repoData.fileContents?.["pom.xml"] || "";
      if (pomContent.includes("h2") || pomContent.includes("H2")) {
        databases.push({ name: "H2 Database", type: "database" });
      }
      if (
        pomContent.includes("mysql") &&
        !databases.some((db) => db.name === "MySQL")
      ) {
        databases.push({ name: "MySQL", type: "database" });
      }
      if (
        pomContent.includes("postgresql") &&
        !databases.some((db) => db.name === "PostgreSQL")
      ) {
        databases.push({ name: "PostgreSQL", type: "database" });
      }
    }

    // Default if none detected
    if (databases.length === 0) {
      databases.push({ name: "Application DB", type: "database" });
    }

    return databases;
  }

  detectInfrastructure(repoData) {
    return repoData.architecture?.infrastructure || ["Docker", "Kubernetes"];
  }

  summarizeArchitecture(repoData) {
    const isJavaProject = this.isJavaProject(repoData);
    const databases = this.detectDatabases(repoData);
    const hasCache = this.detectCache(repoData);
    const hasMessageQueue = this.detectMessageQueue(repoData);

    // Build technologies list
    const technologies = [];

    // Add frontend tech
    const frontendTech = this.getFrontendFramework(repoData, isJavaProject);
    if (frontendTech && frontendTech !== "Web UI") {
      technologies.push(frontendTech);
    }

    // Add backend tech
    const backendTech = this.getBackendFramework(repoData, isJavaProject);
    if (backendTech) {
      technologies.push(backendTech);
    }

    // Add databases
    databases.forEach((db) => {
      if (db.name && db.name !== "Database") {
        technologies.push(db.name);
      }
    });

    // Add cache
    if (hasCache) {
      technologies.push("Redis");
    }

    // Add message queue
    if (hasMessageQueue) {
      technologies.push("Kafka");
    }

    // Build infrastructure list
    const infrastructure = this.detectInfrastructure(repoData);

    return {
      type: this.determineArchitectureType(repoData),
      components: repoData.architecture?.components?.length || 0,
      technologies:
        technologies.length > 0
          ? technologies
          : repoData.architecture?.technologies || [],
      infrastructure:
        infrastructure.length > 0
          ? infrastructure
          : repoData.architecture?.infrastructure || ["Docker", "Kubernetes"],
    };
  }

  determineArchitectureType(repoData) {
    const components = repoData.architecture?.components || [];
    const hasMicroservices = components.some((c) => c.type === "microservice");
    const hasMultipleDatabases = components.filter(
      (c) => c.type === "database",
    ).length;

    if (hasMicroservices || hasMultipleDatabases > 1) {
      return "Microservices";
    }
    if (
      components.some((c) => c.type === "frontend") &&
      components.some((c) => c.type === "backend")
    ) {
      return "Full-Stack";
    }
    return "Monolithic";
  }

  getMockArchitecture() {
    // Mock architecture for demo purposes
    const nodes = [];
    const edges = [];
    let nodeId = 0;

    const createNode = (label, type, x, y) => ({
      id: `node-${nodeId++}`,
      type: "default",
      data: { label, nodeType: type },
      position: { x, y },
      style: { ...this.getNodeStyle(type), width: 180, height: 60 },
      width: 180,
      height: 60,
    });

    const createEdge = (source, target, label = "") => ({
      id: `edge-${source}-${target}`,
      source,
      target,
      label,
      animated: true,
      style: { stroke: "#64748b" },
    });

    // Layer 1: Client
    const clientNode = createNode("Client Browser", "client", 400, 50);
    nodes.push(clientNode);

    // Layer 2: Frontend
    const frontendNode = createNode("React App", "frontend", 400, 200);
    nodes.push(frontendNode);
    edges.push(createEdge(clientNode.id, frontendNode.id, "HTTPS"));

    // Layer 3: API Gateway
    const gatewayNode = createNode("API Gateway", "gateway", 400, 350);
    nodes.push(gatewayNode);
    edges.push(createEdge(frontendNode.id, gatewayNode.id, "REST API"));

    // Layer 4: Microservices
    const services = [
      { name: "User Service", x: 180 },
      { name: "Order Service", x: 400 },
      { name: "Payment Service", x: 620 },
    ];

    const serviceNodes = [];
    services.forEach((service) => {
      const serviceNode = createNode(
        service.name,
        "microservice",
        service.x,
        500,
      );
      nodes.push(serviceNode);
      serviceNodes.push(serviceNode);
      edges.push(createEdge(gatewayNode.id, serviceNode.id, "Route"));
    });

    // Layer 5: Databases
    const databases = [
      { name: "User DB", x: 180 },
      { name: "Order DB", x: 400 },
      { name: "Payment DB", x: 620 },
    ];

    databases.forEach((db, idx) => {
      const dbNode = createNode(db.name, "database", db.x, 650);
      nodes.push(dbNode);
      edges.push(createEdge(serviceNodes[idx].id, dbNode.id, "Query"));
    });

    // Layer 6: Infrastructure
    const infraNode1 = createNode("Docker", "infrastructure", 300, 800);
    const infraNode2 = createNode("Kubernetes", "infrastructure", 500, 800);
    nodes.push(infraNode1, infraNode2);

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        architecture: {
          type: "Microservices",
          components: nodes.length,
          technologies: ["React", "Node.js", "MongoDB", "Redis", "Kafka"],
          infrastructure: ["Docker", "Kubernetes", "AWS"],
        },
        mcpEnhanced: false,
      },
    };
  }
}
export default new ArchitectureGenerator();

// Made with Bob
// Made with Bob
