import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPDataUploader {
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

  /**
   * Upload repository data to MCP Context Studio
   * This creates a knowledge base entry that can be queried later
   */
  async uploadRepositoryData(repoData, contextId = "ctx_7cb36cd100ce") {
    if (!this.isConfigured()) {
      throw new Error("MCP Context Studio is not configured");
    }

    const serverConfig = this.config.mcpServers["context-studio"];

    try {
      console.log(`📤 Uploading repository data to MCP Context Studio...`);
      console.log(`📦 Repository: ${repoData.name}`);
      console.log(`🔑 Context ID: ${contextId}`);

      // Format repository data for MCP ingestion
      const documentContent = this.formatRepositoryForMCP(repoData);

      // Use context-broker-post-events tool to trigger ingestion
      const requestBody = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: "context-broker-post-events",
          arguments: {
            context_id: contextId,
            events: [
              {
                event_type: "document_upload",
                source: "github_analyzer",
                source_id: repoData.html_url || repoData.name,
                data: {
                  title: `${repoData.name} - Architecture Analysis`,
                  content: documentContent,
                  metadata: {
                    repository: repoData.name,
                    language: repoData.language,
                    url: repoData.html_url,
                    stars: repoData.stargazers_count,
                    timestamp: new Date().toISOString(),
                    agent_persona: "ArchitectureAnalyzer",
                  },
                },
                timestamp: new Date().toISOString(),
              },
            ],
          },
        },
      };

      console.log(`📤 Sending document to MCP...`);

      const response = await axios.post(serverConfig.url, requestBody, {
        headers: {
          ...serverConfig.headers,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      });

      console.log(`✅ Upload successful:`, response.status);

      if (response.data.error) {
        throw new Error(`MCP Error: ${JSON.stringify(response.data.error)}`);
      }

      return {
        success: true,
        documentId: response.data.result?.document_id,
        message: "Repository data uploaded to MCP Context Studio",
      };
    } catch (error) {
      console.error("❌ MCP Upload Error:", error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error(
          "Response data:",
          JSON.stringify(error.response.data, null, 2),
        );
      }
      throw new Error(`Failed to upload to Context Studio: ${error.message}`);
    }
  }

  /**
   * Format repository data into a structured document for MCP
   */
  formatRepositoryForMCP(repoData) {
    const sections = [];

    // Repository Overview
    sections.push(`# ${repoData.name} - Architecture Analysis`);
    sections.push(`\n## Repository Information`);
    sections.push(`- **Language**: ${repoData.language}`);
    sections.push(`- **Description**: ${repoData.description || "N/A"}`);
    sections.push(`- **Stars**: ${repoData.stargazers_count || 0}`);
    sections.push(`- **URL**: ${repoData.html_url}`);

    // Architecture Components
    if (repoData.architecture) {
      sections.push(`\n## Architecture Components`);

      if (repoData.architecture.components) {
        sections.push(`\n### Components`);
        repoData.architecture.components.forEach((comp) => {
          sections.push(`\n#### ${comp.name}`);
          sections.push(`- **Type**: ${comp.type}`);
          if (comp.technologies) {
            sections.push(
              `- **Technologies**: ${comp.technologies.join(", ")}`,
            );
          }
          if (comp.description) {
            sections.push(`- **Description**: ${comp.description}`);
          }
        });
      }

      // Controllers
      if (
        repoData.architecture.layers &&
        repoData.architecture.layers.controllers
      ) {
        sections.push(`\n### Controllers`);
        repoData.architecture.layers.controllers.forEach((controller) => {
          sections.push(`- ${controller}`);
        });
      }

      // Services
      if (
        repoData.architecture.layers &&
        repoData.architecture.layers.services
      ) {
        sections.push(`\n### Services`);
        repoData.architecture.layers.services.forEach((service) => {
          sections.push(`- ${service}`);
        });
      }

      // Repositories
      if (
        repoData.architecture.layers &&
        repoData.architecture.layers.repositories
      ) {
        sections.push(`\n### Repositories`);
        repoData.architecture.layers.repositories.forEach((repo) => {
          sections.push(`- ${repo}`);
        });
      }

      // Databases
      if (
        repoData.architecture.layers &&
        repoData.architecture.layers.databases
      ) {
        sections.push(`\n### Databases`);
        repoData.architecture.layers.databases.forEach((db) => {
          sections.push(`- ${db.name} (${db.type})`);
        });
      }
    }

    // Dependencies
    if (repoData.packageInfo && repoData.packageInfo.dependencies) {
      sections.push(`\n## Dependencies`);
      repoData.packageInfo.dependencies.slice(0, 20).forEach((dep) => {
        sections.push(`- ${dep}`);
      });
    }

    // File Structure
    if (repoData.files) {
      sections.push(`\n## Key Files`);
      repoData.files.slice(0, 30).forEach((file) => {
        sections.push(`- ${file.path || file.name}`);
      });
    }

    return sections.join("\n");
  }

  /**
   * Check if repository data exists in MCP
   */
  async checkRepositoryExists(repoName, contextId = "ctx_7cb36cd100ce") {
    if (!this.isConfigured()) {
      throw new Error("MCP Context Studio is not configured");
    }

    const serverConfig = this.config.mcpServers["context-studio"];

    try {
      const requestBody = {
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: "context-broker-vector-query",
          arguments: {
            context_id: contextId,
            AgentPersona: "ArchitectureAnalyzer",
            query: `Repository: ${repoName}`,
            top_k: 1,
          },
        },
      };

      const response = await axios.post(serverConfig.url, requestBody, {
        headers: {
          ...serverConfig.headers,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      const result = response.data.result || response.data;

      // Check if we got actual results or "no_results"
      if (result.content && result.content[0]) {
        const content = result.content[0];
        if (
          content.metadata &&
          content.metadata.search_status === "no_results"
        ) {
          return { exists: false, message: "Repository not found in MCP" };
        }
        return { exists: true, message: "Repository found in MCP" };
      }

      return { exists: false, message: "Repository not found in MCP" };
    } catch (error) {
      console.error("❌ Check failed:", error.message);
      return { exists: false, message: error.message };
    }
  }
}

export default new MCPDataUploader();

// Made with Bob
