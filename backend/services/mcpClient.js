import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPClient {
  constructor() {
    this.config = null;
    this.loadConfig();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, "../../.bob/mcp.json");
      const configData = fs.readFileSync(configPath, "utf8");
      this.config = JSON.parse(configData);
      console.log("✅ MCP Configuration loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load MCP config:", error.message);
      this.config = null;
    }
  }

  isConfigured() {
    return (
      this.config &&
      this.config.mcpServers &&
      this.config.mcpServers["context-studio"]
    );
  }

  async queryContextStudio(query, contextId = "ctx_7cb36cd100ce") {
    if (!this.isConfigured()) {
      throw new Error("MCP Context Studio is not configured");
    }

    const serverConfig = this.config.mcpServers["context-studio"];

    try {
      console.log(`🔗 MCP Server URL: ${serverConfig.url}`);
      console.log(`📝 Query: ${query.substring(0, 100)}...`);

      // Try simpler vector query first (faster than hybrid)
      const requestBody = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: "context-broker-vector-query",
          arguments: {
            context_id: contextId,
            AgentPersona: "ArchitectureAnalyzer",
            query: query,
            top_k: 3,
          },
        },
      };

      console.log(`📤 Sending MCP request (vector query)...`);
      console.log(`⏱️  Timeout: 120 seconds`);

      const response = await axios.post(serverConfig.url, requestBody, {
        headers: {
          ...serverConfig.headers,
          "Content-Type": "application/json",
        },
        timeout: 120000, // Increased to 120 seconds for complex queries
      });

      console.log(`✅ MCP Response received:`, response.status);

      if (response.data.error) {
        throw new Error(`MCP Error: ${JSON.stringify(response.data.error)}`);
      }

      return response.data.result || response.data;
    } catch (error) {
      console.error("❌ MCP Query Error:", error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        console.error(
          "Response data:",
          JSON.stringify(error.response.data, null, 2),
        );
      }
      throw new Error(`Failed to query Context Studio: ${error.message}`);
    }
  }

  async analyzeArchitecture(repoData) {
    const query = `Analyze the architecture of repository "${repoData.name}" (${repoData.language}).
    
Key files detected: ${repoData.files
      ?.slice(0, 10)
      .map((f) => f.name)
      .join(", ")}
Dependencies: ${repoData.packageInfo?.dependencies?.slice(0, 10).join(", ") || "None"}

Identify and list ALL components in this format:
1. CONTROLLERS: List all controller/endpoint classes (e.g., UserController, LoanController)
2. SERVICES: List all service/business logic classes (e.g., UserService, LoanService)
3. REPOSITORIES: List all repository/DAO classes (e.g., UserRepository, LoanRepository)
4. DATABASES: Identify database type and name
5. FRONTEND: Identify frontend framework and key components
6. INFRASTRUCTURE: Docker, Kubernetes, CI/CD tools
7. MESSAGE_QUEUES: Kafka, RabbitMQ, etc.
8. CACHING: Redis, Memcached, etc.

For each component, provide:
- Component name
- Component type (controller/service/repository/database/etc)
- Technology used
- Brief description

Format response as structured JSON with these exact keys: controllers, services, repositories, databases, frontend, infrastructure, messageQueues, caching`;

    try {
      const result = await this.queryContextStudio(query);

      console.log("🔍 Raw MCP result:", JSON.stringify(result, null, 2));

      // Parse and structure the response
      if (result && result.content) {
        const parsedData = this.parseMCPResponse(result.content);
        return {
          analysis: result.content,
          sources: result.sources || [],
          timestamp: new Date().toISOString(),
          components: parsedData, // Structured component data
        };
      }

      return result;
    } catch (error) {
      console.error("Architecture analysis failed:", error.message);
      return null;
    }
  }

  parseMCPResponse(content) {
    // Try to extract structured data from MCP response
    const components = {
      controllers: [],
      services: [],
      repositories: [],
      databases: [],
      frontend: [],
      infrastructure: [],
      messageQueues: [],
      caching: [],
    };

    try {
      // If content is already JSON
      if (typeof content === "object") {
        return { ...components, ...content };
      }

      // Try to parse JSON from string
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { ...components, ...parsed };
      }

      // Extract from text format
      const text =
        typeof content === "string" ? content : JSON.stringify(content);

      // Extract controllers
      const controllerMatch = text.match(
        /CONTROLLERS?:?\s*\n?([\s\S]*?)(?=\n\n|\n[A-Z]+:|$)/i,
      );
      if (controllerMatch) {
        components.controllers = this.extractComponentList(controllerMatch[1]);
      }

      // Extract services
      const serviceMatch = text.match(
        /SERVICES?:?\s*\n?([\s\S]*?)(?=\n\n|\n[A-Z]+:|$)/i,
      );
      if (serviceMatch) {
        components.services = this.extractComponentList(serviceMatch[1]);
      }

      // Extract repositories
      const repoMatch = text.match(
        /REPOSITORIES?:?\s*\n?([\s\S]*?)(?=\n\n|\n[A-Z]+:|$)/i,
      );
      if (repoMatch) {
        components.repositories = this.extractComponentList(repoMatch[1]);
      }

      // Extract databases
      const dbMatch = text.match(
        /DATABASES?:?\s*\n?([\s\S]*?)(?=\n\n|\n[A-Z]+:|$)/i,
      );
      if (dbMatch) {
        components.databases = this.extractComponentList(dbMatch[1]);
      }

      console.log("📊 Parsed MCP components:", {
        controllers: components.controllers.length,
        services: components.services.length,
        repositories: components.repositories.length,
        databases: components.databases.length,
      });
    } catch (error) {
      console.error("⚠️  Failed to parse MCP response:", error.message);
    }

    return components;
  }

  extractComponentList(text) {
    if (!text) return [];

    const lines = text.split("\n").filter((line) => line.trim());
    const components = [];

    for (const line of lines) {
      const cleaned = line.trim().replace(/^[-*•]\s*/, "");
      if (cleaned && !cleaned.match(/^[A-Z\s]+:$/)) {
        components.push({
          name: cleaned.split(/[:-]/)[0].trim(),
          description: cleaned,
        });
      }
    }

    return components;
  }

  getConnectionStatus() {
    return {
      configured: this.isConfigured(),
      server: this.isConfigured() ? "Context Studio" : "Not configured",
      url: this.isConfigured()
        ? this.config.mcpServers["context-studio"].url
        : null,
    };
  }
}

export default new MCPClient();

// Made with Bob
