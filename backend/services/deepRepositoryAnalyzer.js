import mcpClient from "./mcpClient.js";
import githubAnalyzer from "./githubAnalyzer.js";

/**
 * Deep Repository Analyzer
 * Uses MCP Context Studio to analyze repository structure and generate
 * real flow-based architecture diagrams from actual code analysis
 */
class DeepRepositoryAnalyzer {
  constructor() {
    this.analysisCache = new Map();
  }

  /**
   * Main analysis entry point - orchestrates deep repository analysis
   */
  async analyzeRepositoryDeep(repoUrl) {
    console.log("\n🔬 Starting Deep Repository Analysis...");
    console.log(`📍 Repository: ${repoUrl}`);

    // Step 1: GitHub Analysis
    console.log("\n📊 Step 1: GitHub Repository Analysis");
    const githubData = await githubAnalyzer.analyzeRepository(repoUrl);

    console.log(`✅ Found ${githubData.files?.length || 0} files`);
    console.log(`✅ Detected language: ${githubData.language}`);
    console.log(`✅ Architecture layers:`, {
      controllers: githubData.architecture?.layers?.controllers?.length || 0,
      services: githubData.architecture?.layers?.services?.length || 0,
      repositories: githubData.architecture?.layers?.repositories?.length || 0,
    });

    // Step 2: MCP Context Studio Analysis
    console.log("\n🤖 Step 2: MCP Context Studio Deep Analysis");
    let mcpEnhancedData = null;

    if (mcpClient.isConfigured()) {
      try {
        mcpEnhancedData = await this.queryMCPForArchitecture(githubData);
        console.log("✅ MCP analysis complete");
      } catch (error) {
        console.warn("⚠️  MCP analysis failed:", error.message);
      }
    } else {
      console.log("⚠️  MCP not configured, using GitHub analysis only");
    }

    // Step 3: Extract Flow Components
    console.log("\n🔍 Step 3: Extracting Flow Components");
    const flowComponents = this.extractFlowComponents(
      githubData,
      mcpEnhancedData,
    );

    console.log(`✅ Extracted ${flowComponents.totalComponents} components`);
    console.log(`   - Controllers: ${flowComponents.controllers.length}`);
    console.log(`   - Services: ${flowComponents.services.length}`);
    console.log(`   - Repositories: ${flowComponents.repositories.length}`);
    console.log(`   - Databases: ${flowComponents.databases.length}`);
    console.log(
      `   - External Systems: ${flowComponents.externalSystems.length}`,
    );

    // Step 4: Build Execution Flow
    console.log("\n🔄 Step 4: Building Execution Flow");
    const executionFlow = this.buildExecutionFlow(flowComponents, githubData);

    console.log(
      `✅ Built execution flow with ${executionFlow.flows.length} flows`,
    );

    // Step 5: Generate Architecture Metadata
    console.log("\n📋 Step 5: Generating Architecture Metadata");
    const architectureMetadata = this.generateArchitectureMetadata(
      githubData,
      flowComponents,
      executionFlow,
      mcpEnhancedData,
    );

    console.log("✅ Deep Repository Analysis Complete\n");

    return {
      repository: {
        name: githubData.name,
        description: githubData.description,
        language: githubData.language,
        url: repoUrl,
      },
      flowComponents,
      executionFlow,
      metadata: architectureMetadata,
      githubData,
      mcpEnhanced: mcpEnhancedData !== null,
      mcpData: mcpEnhancedData,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Query MCP Context Studio for enhanced architecture insights
   */
  async queryMCPForArchitecture(githubData) {
    const queries = [
      // Query 1: Component Discovery
      this.buildComponentDiscoveryQuery(githubData),
      // Query 2: Flow Analysis
      this.buildFlowAnalysisQuery(githubData),
      // Query 3: Technology Stack
      this.buildTechStackQuery(githubData),
    ];

    const results = [];

    for (const query of queries) {
      try {
        const result = await mcpClient.queryContextStudio(query);
        results.push(result);
      } catch (error) {
        console.warn(`⚠️  MCP query failed: ${error.message}`);
        results.push(null);
      }
    }

    return {
      componentDiscovery: results[0],
      flowAnalysis: results[1],
      techStack: results[2],
    };
  }

  buildComponentDiscoveryQuery(githubData) {
    const fileList = githubData.files
      ?.slice(0, 50)
      .map((f) => f.path)
      .join(", ");

    return `Analyze the repository "${githubData.name}" and identify ALL architectural components:

Repository Language: ${githubData.language}
Key Files: ${fileList}

Please identify and categorize:
1. CONTROLLERS/ENDPOINTS: All API controllers, REST endpoints, GraphQL resolvers
2. SERVICES: Business logic services, domain services, application services
3. REPOSITORIES/DAOs: Data access objects, repository classes
4. ENTITIES/MODELS: Domain models, database entities
5. MIDDLEWARE: Authentication, authorization, logging middleware
6. EXTERNAL_INTEGRATIONS: Third-party APIs, external services
7. DATABASES: Database types and configurations
8. MESSAGE_QUEUES: Kafka, RabbitMQ, SQS, etc.
9. CACHING: Redis, Memcached, etc.
10. AI_ML_COMPONENTS: Machine learning models, AI services

For each component, provide:
- Exact name (class/file name)
- Type (controller/service/repository/etc)
- Technology/framework used
- Brief purpose

Format as structured JSON.`;
  }

  buildFlowAnalysisQuery(githubData) {
    return `Analyze the request/execution flow in repository "${githubData.name}":

Identify:
1. REQUEST_LIFECYCLE: How requests flow through the system
2. AUTHENTICATION_FLOW: Auth/authorization sequence
3. DATA_FLOW: How data moves between layers
4. EVENT_FLOW: Async event processing patterns
5. ERROR_HANDLING: Error propagation and handling

Describe the typical flow from client request to database and back.
Include sync vs async operations.`;
  }

  buildTechStackQuery(githubData) {
    return `Identify the complete technology stack for "${githubData.name}":

Categorize technologies:
1. FRONTEND: React, Vue, Angular, etc.
2. BACKEND: Spring Boot, Express, Django, etc.
3. DATABASES: PostgreSQL, MongoDB, MySQL, etc.
4. CACHING: Redis, Memcached
5. MESSAGE_QUEUES: Kafka, RabbitMQ
6. CLOUD: AWS, Azure, GCP services
7. DEVOPS: Docker, Kubernetes, CI/CD
8. MONITORING: Prometheus, Grafana, ELK
9. AI_ML: TensorFlow, PyTorch, scikit-learn

Provide confidence level for each detection.`;
  }

  /**
   * Extract flow components from GitHub and MCP data
   */
  extractFlowComponents(githubData, mcpData) {
    const components = {
      controllers: [],
      services: [],
      repositories: [],
      entities: [],
      middleware: [],
      databases: [],
      caching: [],
      messageQueues: [],
      externalSystems: [],
      aiComponents: [],
      frontend: [],
    };

    // Extract from GitHub analysis
    const arch = githubData.architecture;

    console.log("🔍 Extracting components from GitHub analysis...");
    console.log(
      "   Controllers found:",
      arch?.layers?.controllers?.length || 0,
    );
    console.log("   Services found:", arch?.layers?.services?.length || 0);
    console.log(
      "   Repositories found:",
      arch?.layers?.repositories?.length || 0,
    );

    if (arch?.layers?.controllers) {
      components.controllers = arch.layers.controllers.map((name) => ({
        name,
        type: "controller",
        source: "github",
        technology: this.detectTechnology(name, githubData.language),
      }));
    }

    if (arch?.layers?.services) {
      components.services = arch.layers.services.map((name) => ({
        name,
        type: "service",
        source: "github",
        technology: this.detectTechnology(name, githubData.language),
      }));
    }

    if (arch?.layers?.repositories) {
      components.repositories = arch.layers.repositories.map((name) => ({
        name,
        type: "repository",
        source: "github",
        technology: this.detectTechnology(name, githubData.language),
      }));
    }

    // If no components detected but we have files, infer from file structure
    if (
      components.controllers.length === 0 &&
      components.services.length === 0 &&
      components.repositories.length === 0
    ) {
      console.log("⚠️  No components in layers, inferring from files...");
      this.inferComponentsFromFiles(githubData, components);
    }

    // Extract databases
    if (arch?.databases) {
      components.databases = arch.databases.map((db) => ({
        name: db.name || db,
        type: "database",
        source: "github",
        technology: db.type || "SQL",
      }));
    }

    // Extract infrastructure
    if (arch?.infrastructure) {
      arch.infrastructure.forEach((infra) => {
        const lower = infra.toLowerCase();
        if (lower.includes("kafka") || lower.includes("rabbit")) {
          components.messageQueues.push({
            name: infra,
            type: "messageQueue",
            source: "github",
            technology: infra,
          });
        } else if (lower.includes("redis") || lower.includes("memcache")) {
          components.caching.push({
            name: infra,
            type: "cache",
            source: "github",
            technology: infra,
          });
        }
      });
    }

    // Enhance with MCP data if available
    if (mcpData?.componentDiscovery) {
      this.enhanceWithMCPData(components, mcpData);
    }

    // Calculate totals
    components.totalComponents =
      components.controllers.length +
      components.services.length +
      components.repositories.length +
      components.databases.length +
      components.caching.length +
      components.messageQueues.length +
      components.externalSystems.length +
      components.aiComponents.length;

    console.log("✅ Component extraction complete:");
    console.log(`   Controllers: ${components.controllers.length}`);
    console.log(`   Services: ${components.services.length}`);
    console.log(`   Repositories: ${components.repositories.length}`);
    console.log(`   Databases: ${components.databases.length}`);

    return components;
  }

  /**
   * Infer components from file structure when layers are empty
   */
  inferComponentsFromFiles(githubData, components) {
    const files = githubData.files || [];

    console.log(`   Total files available: ${files.length}`);
    console.log(`   Project language: ${githubData.language}`);

    // Debug: Show sample files
    if (files.length > 0) {
      console.log(
        `   Sample files:`,
        files.slice(0, 5).map((f) => ({ name: f.name, path: f.path })),
      );
    }

    // Helper to get file name from file object (handles both .name and .path)
    const getFileName = (file) => {
      if (file.name) return file.name;
      if (file.path) return file.path.split("/").pop();
      return "";
    };

    // Helper to get full path for logging
    const getFilePath = (file) => file.path || file.name || "";

    // Look for controller/route files (Java, Node.js, Python patterns)
    const controllerFiles = files.filter((f) => {
      const fileName = getFileName(f);
      const filePath = getFilePath(f).toLowerCase();
      const matches =
        fileName &&
        (fileName.includes("Controller") ||
          fileName.includes("Resource") ||
          fileName.includes("Endpoint") ||
          fileName.includes("Routes") ||
          fileName.includes("Router") ||
          filePath.includes("controller") ||
          filePath.includes("routes") ||
          filePath.includes("api"));

      return matches;
    });

    console.log(`   Found ${controllerFiles.length} controller/route files`);

    controllerFiles.slice(0, 10).forEach((file) => {
      const fileName = getFileName(file);
      const name = fileName
        .replace(/\.(java|ts|js|jsx|py)$/, "")
        .replace(/Routes?$/i, " API")
        .replace(/Router$/i, " API");
      components.controllers.push({
        name,
        type: "controller",
        source: "inferred",
        technology: this.detectTechnology(name, githubData.language),
      });
    });

    // Look for service files (broader patterns for Node.js projects)
    const serviceFiles = files.filter((f) => {
      const fileName = getFileName(f);
      const filePath = getFilePath(f).toLowerCase();

      // Exclude test files, config files, and build artifacts
      if (
        fileName.includes(".test.") ||
        fileName.includes(".spec.") ||
        fileName.includes("config") ||
        fileName.includes("Config") ||
        filePath.includes("node_modules") ||
        filePath.includes("dist") ||
        filePath.includes("build")
      ) {
        return false;
      }

      return (
        fileName &&
        (fileName.includes("Service") ||
          fileName.includes("Manager") ||
          fileName.includes("Handler") ||
          fileName.includes("Analyzer") ||
          fileName.includes("Generator") ||
          fileName.includes("Client") ||
          fileName.includes("Uploader") ||
          filePath.includes("/services/") ||
          filePath.includes("/service/") ||
          filePath.includes("\\services\\") ||
          filePath.includes("\\service\\"))
      );
    });

    console.log(`   Found ${serviceFiles.length} service files`);

    serviceFiles.slice(0, 12).forEach((file) => {
      const fileName = getFileName(file);
      const name = fileName
        .replace(/\.(java|ts|js|jsx|py)$/, "")
        .replace(/Impl$/, "")
        .replace(/Service$/, "");
      components.services.push({
        name,
        type: "service",
        source: "inferred",
        technology: this.detectTechnology(name, githubData.language),
      });
    });

    // Look for repository/data access files
    const repoFiles = files.filter((f) => {
      const fileName = getFileName(f);
      const filePath = getFilePath(f).toLowerCase();
      return (
        fileName &&
        (fileName.includes("Repository") ||
          fileName.includes("Dao") ||
          fileName.includes("Store") ||
          fileName.includes("Model") ||
          filePath.includes("repository") ||
          filePath.includes("/models/") ||
          filePath.includes("\\models\\"))
      );
    });

    console.log(`   Found ${repoFiles.length} repository/model files`);

    repoFiles.slice(0, 8).forEach((file) => {
      const fileName = getFileName(file);
      const name = fileName.replace(/\.(java|ts|js|jsx|py)$/, "");
      components.repositories.push({
        name,
        type: "repository",
        source: "inferred",
        technology: this.detectTechnology(name, githubData.language),
      });
    });

    // Detect databases from package.json or pom.xml
    if (githubData.architecture?.packageInfo?.dependencies) {
      const deps = githubData.architecture.packageInfo.dependencies;
      if (deps.includes("mongoose") || deps.includes("mongodb")) {
        components.databases.push({
          name: "MongoDB",
          type: "database",
          source: "inferred",
          technology: "NoSQL",
        });
      }
      if (deps.includes("pg") || deps.includes("postgresql")) {
        components.databases.push({
          name: "PostgreSQL",
          type: "database",
          source: "inferred",
          technology: "SQL",
        });
      }
      if (deps.includes("mysql")) {
        components.databases.push({
          name: "MySQL",
          type: "database",
          source: "inferred",
          technology: "SQL",
        });
      }
      if (deps.includes("redis")) {
        components.caching.push({
          name: "Redis",
          type: "cache",
          source: "inferred",
          technology: "In-Memory",
        });
      }
    }

    console.log(
      `   ✅ Inferred ${components.controllers.length} controllers from files`,
    );
    console.log(
      `   ✅ Inferred ${components.services.length} services from files`,
    );
    console.log(
      `   ✅ Inferred ${components.repositories.length} repositories from files`,
    );
    console.log(
      `   ✅ Inferred ${components.databases.length} databases from dependencies`,
    );
  }

  detectTechnology(componentName, language) {
    const name = componentName.toLowerCase();

    if (language === "Java") {
      if (name.includes("controller")) return "Spring MVC";
      if (name.includes("service")) return "Spring Service";
      if (name.includes("repository")) return "Spring Data";
      return "Spring Boot";
    } else if (language === "JavaScript" || language === "TypeScript") {
      if (name.includes("controller")) return "Express/NestJS";
      if (name.includes("service")) return "Node.js Service";
      return "Node.js";
    } else if (language === "Python") {
      if (name.includes("view")) return "Django/Flask";
      if (name.includes("service")) return "Python Service";
      return "Python";
    }

    return language;
  }

  enhanceWithMCPData(components, mcpData) {
    // Parse MCP component discovery results
    try {
      const mcpComponents = mcpData.componentDiscovery?.content;
      if (mcpComponents && typeof mcpComponents === "object") {
        // Merge MCP-discovered components
        if (mcpComponents.controllers) {
          components.controllers.push(
            ...mcpComponents.controllers.map((c) => ({
              ...c,
              source: "mcp",
            })),
          );
        }
        if (mcpComponents.services) {
          components.services.push(
            ...mcpComponents.services.map((c) => ({
              ...c,
              source: "mcp",
            })),
          );
        }
      }
    } catch (error) {
      console.warn("⚠️  Failed to enhance with MCP data:", error.message);
    }
  }

  /**
   * Build execution flow graph
   */
  buildExecutionFlow(components, githubData) {
    const flows = [];

    // Build typical request flow
    flows.push({
      name: "Request Lifecycle",
      type: "sync",
      steps: [
        { component: "Client", layer: "client" },
        { component: "API Gateway", layer: "gateway" },
        { component: "Load Balancer", layer: "gateway" },
        ...components.controllers.slice(0, 3).map((c) => ({
          component: c.name,
          layer: "api",
        })),
        ...components.services.slice(0, 3).map((c) => ({
          component: c.name,
          layer: "service",
        })),
        ...components.repositories.slice(0, 2).map((c) => ({
          component: c.name,
          layer: "data",
        })),
        ...components.databases.slice(0, 1).map((c) => ({
          component: c.name,
          layer: "database",
        })),
      ],
    });

    // Build async event flow if message queues detected
    if (components.messageQueues.length > 0) {
      flows.push({
        name: "Event Processing Flow",
        type: "async",
        steps: [
          ...components.services.slice(0, 2).map((c) => ({
            component: c.name,
            layer: "service",
          })),
          ...components.messageQueues.map((c) => ({
            component: c.name,
            layer: "messaging",
          })),
          { component: "Event Processor", layer: "service" },
          ...components.databases.slice(0, 1).map((c) => ({
            component: c.name,
            layer: "database",
          })),
        ],
      });
    }

    return { flows, totalFlows: flows.length };
  }

  /**
   * Generate comprehensive architecture metadata
   */
  generateArchitectureMetadata(githubData, components, flow, mcpData) {
    const metadata = {
      architectureType: this.detectArchitectureType(components),
      deploymentType: this.detectDeploymentType(githubData),
      techStack: this.buildTechStack(githubData, components),
      confidence: this.calculateConfidence(githubData, mcpData),
      reasoning: this.generateReasoning(githubData, components, mcpData),
      serviceCategories: this.categorizeServices(components),
      componentCount: components.totalComponents,
      connectionCount: this.estimateConnections(components),
      layers: this.identifyLayers(components),
    };

    return metadata;
  }

  detectArchitectureType(components) {
    if (components.services.length > 5) {
      return "Microservices Architecture";
    } else if (components.services.length > 0) {
      return "Service-Oriented Architecture";
    } else if (components.controllers.length > 0) {
      return "Layered Architecture";
    }
    return "Monolithic Architecture";
  }

  detectDeploymentType(githubData) {
    const infra = githubData.architecture?.infrastructure || [];
    const infraStr = infra.join(" ").toLowerCase();

    if (infraStr.includes("kubernetes") || infraStr.includes("k8s")) {
      return "Kubernetes Cloud-Native";
    } else if (infraStr.includes("docker")) {
      return "Containerized Deployment";
    } else if (
      infraStr.includes("aws") ||
      infraStr.includes("azure") ||
      infraStr.includes("gcp")
    ) {
      return "Cloud Platform Deployment";
    }
    return "Traditional Deployment";
  }

  buildTechStack(githubData, components) {
    const stack = new Set();

    stack.add(githubData.language);

    components.controllers.forEach((c) => stack.add(c.technology));
    components.services.forEach((c) => stack.add(c.technology));
    components.databases.forEach((c) => stack.add(c.technology));

    if (githubData.architecture?.technologies) {
      githubData.architecture.technologies.forEach((t) => stack.add(t));
    }

    return Array.from(stack).filter(Boolean);
  }

  calculateConfidence(githubData, mcpData) {
    let score = 0;

    // GitHub data quality
    if (githubData.files?.length > 10) score += 20;
    if (githubData.architecture?.layers?.controllers?.length > 0) score += 20;
    if (githubData.architecture?.layers?.services?.length > 0) score += 20;
    if (githubData.architecture?.layers?.repositories?.length > 0) score += 15;

    // MCP enhancement
    if (mcpData) score += 25;

    return Math.min(score, 100);
  }

  generateReasoning(githubData, components, mcpData) {
    const reasons = [];

    reasons.push(
      `Detected ${githubData.language} project with ${githubData.files?.length || 0} files`,
    );

    if (components.controllers.length > 0) {
      reasons.push(
        `Found ${components.controllers.length} API controllers/endpoints`,
      );
    }

    if (components.services.length > 0) {
      reasons.push(
        `Identified ${components.services.length} business services`,
      );
    }

    if (components.databases.length > 0) {
      reasons.push(`Detected ${components.databases.length} database(s)`);
    }

    if (mcpData) {
      reasons.push("Enhanced with MCP Context Studio analysis");
    }

    return reasons;
  }

  categorizeServices(components) {
    return {
      api: components.controllers.length,
      business: components.services.length,
      data: components.repositories.length,
      infrastructure:
        components.databases.length +
        components.caching.length +
        components.messageQueues.length,
    };
  }

  estimateConnections(components) {
    // Estimate based on typical layered architecture
    const controllerToService = components.controllers.length * 2;
    const serviceToRepo = components.services.length * 1.5;
    const repoToDb = components.repositories.length;

    return Math.floor(controllerToService + serviceToRepo + repoToDb);
  }

  identifyLayers(components) {
    const layers = [];

    if (components.frontend.length > 0) layers.push("Client Layer");
    layers.push("API Gateway Layer");
    if (components.controllers.length > 0) layers.push("API Layer");
    if (components.services.length > 0) layers.push("Business Services Layer");
    if (components.messageQueues.length > 0)
      layers.push("Event Processing Layer");
    if (components.repositories.length > 0 || components.databases.length > 0) {
      layers.push("Data Layer");
    }

    return layers;
  }
}

export default new DeepRepositoryAnalyzer();

// Made with Bob
