import axios from "axios";
import fs from "fs";

// Load MCP configuration
const configPath = "./.bob/mcp.json";
const configData = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configData);

const serverConfig = config.mcpServers["context-studio"];
const contextId = "ctx_7cb36cd100ce";

console.log("🔍 Testing MCP Connection...\n");
console.log("📡 Server URL:", serverConfig.url);
console.log("🔑 Context ID:", contextId);
console.log("\n" + "=".repeat(60) + "\n");

// Test 1: Simple query to check if context exists
async function testContextExists() {
  console.log("Test 1: Checking if context exists...");

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
          query: "test query",
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

    console.log("✅ Response Status:", response.status);
    console.log("📦 Response Data:", JSON.stringify(response.data, null, 2));

    if (response.data.result) {
      const result = response.data.result;
      if (result.content && result.content[0]) {
        const content = result.content[0];
        if (
          content.metadata &&
          content.metadata.search_status === "no_results"
        ) {
          console.log("\n⚠️  Context exists but has NO DATA");
          console.log("💡 This means the context is valid but empty");
          return { exists: true, hasData: false };
        } else {
          console.log("\n✅ Context exists and HAS DATA");
          return { exists: true, hasData: true };
        }
      }
    }

    return { exists: true, hasData: false };
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error(
        "Response Data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    return { exists: false, hasData: false };
  }
}

// Test 2: Query for specific repository
async function testRepositoryQuery(repoName) {
  console.log(`\nTest 2: Querying for repository "${repoName}"...`);

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
          query: `Find architecture information for repository: ${repoName}. List all controllers, services, repositories, and databases.`,
          top_k: 5,
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

    console.log("✅ Response Status:", response.status);

    if (response.data.result) {
      const result = response.data.result;
      console.log("\n📊 Query Results:");
      console.log(JSON.stringify(result, null, 2));

      if (result.content && result.content[0]) {
        const content = result.content[0];
        if (
          content.metadata &&
          content.metadata.search_status === "no_results"
        ) {
          console.log("\n⚠️  No data found for this repository");
          return { found: false };
        } else if (content.content) {
          console.log("\n✅ Data found!");
          console.log("📄 Content:", content.content.substring(0, 500) + "...");
          return { found: true, data: content };
        }
      }
    }

    return { found: false };
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error(
        "Response Data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    return { found: false };
  }
}

// Test 3: List available tools
async function testListTools() {
  console.log("\nTest 3: Listing available MCP tools...");

  try {
    const requestBody = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/list",
      params: {},
    };

    const response = await axios.post(serverConfig.url, requestBody, {
      headers: {
        ...serverConfig.headers,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    console.log("✅ Response Status:", response.status);

    if (response.data.result && response.data.result.tools) {
      console.log("\n📋 Available Tools:");
      response.data.result.tools.forEach((tool, idx) => {
        console.log(`\n${idx + 1}. ${tool.name}`);
        console.log(`   Description: ${tool.description || "N/A"}`);
      });
      return { success: true, tools: response.data.result.tools };
    }

    return { success: false };
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error(
        "Response Data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    return { success: false };
  }
}

// Test 4: Try to add a test document
async function testAddDocument() {
  console.log("\nTest 4: Testing document upload capability...");

  try {
    const requestBody = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: "context-broker-add-document",
        arguments: {
          context_id: contextId,
          AgentPersona: "ArchitectureAnalyzer",
          document: {
            title: "Test Document - MCP Connection Verification",
            content: `# Test Repository Architecture

## Controllers
- TestController
- UserController

## Services  
- TestService
- UserService

## Repositories
- TestRepository
- UserRepository

## Databases
- PostgreSQL
- Redis Cache

This is a test document to verify MCP upload functionality.`,
            metadata: {
              repository: "test/verification-repo",
              language: "JavaScript",
              timestamp: new Date().toISOString(),
              test: true,
            },
          },
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

    console.log("✅ Response Status:", response.status);
    console.log("📦 Response:", JSON.stringify(response.data, null, 2));

    if (response.data.result) {
      console.log("\n✅ Document upload successful!");
      console.log("📄 Document ID:", response.data.result.document_id || "N/A");
      return { success: true, documentId: response.data.result.document_id };
    }

    return { success: false };
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error(
        "Response Data:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    return { success: false };
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting MCP Connection Tests\n");

  // Test 1: Check context
  const contextTest = await testContextExists();
  console.log("\n" + "=".repeat(60) + "\n");

  // Test 2: Query for a repository
  const repoTest = await testRepositoryQuery("devConnector-Frontend");
  console.log("\n" + "=".repeat(60) + "\n");

  // Test 3: List tools
  const toolsTest = await testListTools();
  console.log("\n" + "=".repeat(60) + "\n");

  // Test 4: Try to add document
  const uploadTest = await testAddDocument();
  console.log("\n" + "=".repeat(60) + "\n");

  // Summary
  console.log("\n📊 TEST SUMMARY\n");
  console.log("1. Context Exists:", contextTest.exists ? "✅ YES" : "❌ NO");
  console.log(
    "2. Context Has Data:",
    contextTest.hasData ? "✅ YES" : "⚠️  NO (Empty)",
  );
  console.log("3. Repository Found:", repoTest.found ? "✅ YES" : "⚠️  NO");
  console.log("4. Tools Available:", toolsTest.success ? "✅ YES" : "❌ NO");
  console.log("5. Upload Works:", uploadTest.success ? "✅ YES" : "❌ NO");

  console.log("\n💡 RECOMMENDATIONS:\n");

  if (!contextTest.exists) {
    console.log("❌ Context ID is invalid or inaccessible");
    console.log("   → Check your authentication tokens");
    console.log("   → Verify the context ID is correct");
  } else if (!contextTest.hasData) {
    console.log("⚠️  Context is valid but empty");
    console.log("   → Upload repository data using the application");
    console.log("   → Or use the test upload above");
  } else {
    console.log("✅ Context is working correctly!");
  }

  if (!uploadTest.success) {
    console.log("\n❌ Upload functionality not working");
    console.log("   → Check if you have write permissions");
    console.log(
      "   → Verify the tool name 'context-broker-add-document' is correct",
    );
  }

  console.log("\n" + "=".repeat(60) + "\n");
}

// Run tests
runAllTests().catch(console.error);

// Made with Bob
