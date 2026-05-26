import axios from "axios";

class GitHubAnalyzer {
  constructor() {
    this.apiBase = "https://api.github.com";
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

  logError(...args) {
    if (!this.silent) {
      console.error(...args);
    }
  }

  parseRepoUrl(url) {
    // Extract owner and repo from GitHub URL
    // Handle URLs like: github.com/owner/repo or github.com/owner/repo/tree/branch
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error("Invalid GitHub repository URL");
    }

    let repo = match[2];

    // Remove .git suffix
    repo = repo.replace(".git", "");

    // Remove /tree/branch or /blob/branch suffixes
    repo = repo.replace(/\/(tree|blob)\/.*$/, "");

    // Extract branch if present in URL
    const branchMatch = url.match(/\/(tree|blob)\/([^\/]+)/);
    const branch = branchMatch ? branchMatch[2] : null;

    this.log(
      `📍 Parsed: owner=${match[1]}, repo=${repo}, branch=${branch || "default"}`,
    );

    return {
      owner: match[1],
      repo: repo,
      branch: branch,
    };
  }

  async fetchRepoContents(owner, repo, path = "", branch = null) {
    try {
      const url = branch
        ? `${this.apiBase}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
        : `${this.apiBase}/repos/${owner}/${repo}/contents/${path}`;

      const response = await axios.get(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Enterprise-AI-SDLC-CoPilot",
        },
      });
      return response.data;
    } catch (error) {
      this.logError(`Failed to fetch contents for ${path}:`, error.message);
      return [];
    }
  }

  async fetchFileContent(owner, repo, path, branch = null) {
    try {
      const url = branch
        ? `${this.apiBase}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
        : `${this.apiBase}/repos/${owner}/${repo}/contents/${path}`;

      const response = await axios.get(url, {
        headers: {
          Accept: "application/vnd.github.v3.raw",
          "User-Agent": "Enterprise-AI-SDLC-CoPilot",
        },
      });
      return response.data;
    } catch (error) {
      this.logError(`Failed to fetch file ${path}:`, error.message);
      return null;
    }
  }

  async analyzeRepository(repoUrl) {
    const { owner, repo, branch } = this.parseRepoUrl(repoUrl);

    this.log(
      `📊 Deep analyzing repository: ${owner}/${repo}${branch ? ` (branch: ${branch})` : ""}`,
    );

    // Store branch for use in other methods
    this.currentBranch = branch;

    // Fetch repository metadata
    const repoInfo = await this.fetchRepoInfo(owner, repo);

    // Perform deep scan of repository structure
    this.log("🔍 Scanning repository structure...");
    const allFiles = await this.deepScanRepository(
      owner,
      repo,
      "",
      5,
      0,
      branch,
    );

    this.log(`📁 Found ${allFiles.length} files`);

    // Debug: Show file types
    const javaFiles = allFiles.filter(
      (f) => f.name && f.name.endsWith(".java"),
    );
    this.log(`📁 Java files: ${javaFiles.length}`);
    if (javaFiles.length > 0) {
      this.log(
        `📁 Sample Java files:`,
        javaFiles.slice(0, 5).map((f) => f.path),
      );
    }

    // Fetch root directory contents
    const rootContents = await this.fetchRepoContents(owner, repo, "", branch);

    // Identify key files
    const keyFiles = this.identifyKeyFiles(rootContents);

    // Fetch and analyze key configuration files
    const fileContents = await this.fetchKeyFileContents(
      owner,
      repo,
      keyFiles,
      branch,
    );

    // Perform deep architecture analysis
    this.log("🏗️  Analyzing architecture patterns...");
    const architecture = await this.deepAnalyzeArchitecture(
      owner,
      repo,
      allFiles,
      fileContents,
      rootContents,
    );

    // Analyze file relationships and build dependency graph
    const relationships = await this.analyzeFileRelationships(
      owner,
      repo,
      allFiles,
    );
    const dependencyGraph = this.buildDependencyGraph(allFiles, relationships);

    // Override language detection based on project files
    let detectedLanguage = repoInfo.language;
    if (fileContents["pom.xml"] || fileContents["build.gradle"]) {
      detectedLanguage = "Java";
      this.log("🔧 Detected Java/Spring Boot project");
    } else if (fileContents["package.json"]) {
      detectedLanguage = "JavaScript";
      this.log("🔧 Detected JavaScript/Node.js project");
    } else if (fileContents["requirements.txt"]) {
      detectedLanguage = "Python";
      this.log("🔧 Detected Python project");
    } else if (fileContents["go.mod"]) {
      detectedLanguage = "Go";
      this.log("🔧 Detected Go project");
    }

    return {
      name: `${owner}/${repo}`,
      description: repoInfo.description,
      language: detectedLanguage,
      files: allFiles,
      keyFiles,
      fileContents,
      packageInfo: architecture.packageInfo,
      architecture,
      relationships,
      dependencyGraph,
    };
  }

  async deepScanRepository(
    owner,
    repo,
    path = "",
    maxDepth = 5,
    currentDepth = 0,
    branch = null,
  ) {
    if (currentDepth >= maxDepth) {
      this.log(`⚠️  Reached max depth ${maxDepth} at path: ${path}`);
      return [];
    }

    const allFiles = [];

    try {
      this.log(`🔍 Scanning depth ${currentDepth}: ${path || "(root)"}`);
      const contents = await this.fetchRepoContents(owner, repo, path, branch);

      this.log(`   Found ${contents.length} items at ${path || "(root)"}`);

      const dirs = contents.filter((item) => item.type === "dir");
      const files = contents.filter((item) => item.type === "file");

      this.log(`   - ${files.length} files, ${dirs.length} directories`);

      for (const item of contents) {
        if (item.type === "file") {
          allFiles.push({
            name: item.name,
            path: item.path,
            type: this.categorizeFile(item.name),
            size: item.size,
          });
        } else if (item.type === "dir") {
          // Recursively scan directories
          this.log(`   📁 Entering directory: ${item.path}`);
          const subFiles = await this.deepScanRepository(
            owner,
            repo,
            item.path,
            maxDepth,
            currentDepth + 1,
            branch,
          );
          allFiles.push(...subFiles);
        }
      }
    } catch (error) {
      this.logError(`❌ Error scanning ${path}:`, error.message);
      if (error.response) {
        this.logError(`   Status: ${error.response.status}`);
        this.logError(
          `   Message: ${error.response.data?.message || "Unknown"}`,
        );
      }
    }

    return allFiles;
  }

  async deepAnalyzeArchitecture(
    owner,
    repo,
    allFiles,
    fileContents,
    rootContents,
  ) {
    const architecture = {
      packageInfo: {},
      components: [],
      layers: {},
      technologies: [],
      infrastructure: [],
      patterns: [],
    };

    // Detect project type
    const isJava =
      allFiles.some((f) => f.name.endsWith(".java")) || fileContents["pom.xml"];
    const isSpringBoot = fileContents["pom.xml"]?.includes("spring-boot");
    const isNodeJS = fileContents["package.json"];
    const isPython = allFiles.some((f) => f.name.endsWith(".py"));

    this.log(
      `📦 Project type: ${isJava ? "Java" : isNodeJS ? "Node.js" : isPython ? "Python" : "Unknown"}`,
    );

    if (isSpringBoot) {
      return await this.analyzeSpringBootProject(
        owner,
        repo,
        allFiles,
        fileContents,
      );
    } else if (isNodeJS) {
      return await this.analyzeNodeJSProject(
        owner,
        repo,
        allFiles,
        fileContents,
      );
    } else if (isPython) {
      return await this.analyzePythonProject(
        owner,
        repo,
        allFiles,
        fileContents,
      );
    }

    // Fallback to basic analysis
    return this.inferArchitecture(fileContents, rootContents);
  }

  async analyzeSpringBootProject(owner, repo, allFiles, fileContents) {
    this.log("🍃 Analyzing Spring Boot project structure...");

    const architecture = {
      packageInfo: {},
      components: [],
      layers: {
        controllers: [],
        services: [],
        repositories: [],
        models: [],
        config: [],
      },
      technologies: ["Java", "Spring Boot"],
      infrastructure: [],
      patterns: ["MVC", "Layered Architecture"],
    };

    // Parse pom.xml for dependencies
    if (fileContents["pom.xml"]) {
      const pomContent = fileContents["pom.xml"];
      const dependencies = [];
      const depMatches = pomContent.matchAll(
        /<artifactId>(.*?)<\/artifactId>/g,
      );
      for (const match of depMatches) {
        dependencies.push(match[1]);
      }
      architecture.packageInfo = {
        name: "spring-project",
        type: "maven",
        dependencies: dependencies.slice(0, 30),
      };

      // Detect technologies from dependencies
      if (pomContent.includes("spring-boot-starter-web")) {
        architecture.technologies.push("Spring Web");
        architecture.components.push({
          type: "backend",
          framework: "Spring Boot",
        });
      }
      if (pomContent.includes("spring-boot-starter-data-jpa")) {
        architecture.technologies.push("Spring Data JPA");
      }
      if (pomContent.includes("thymeleaf")) {
        architecture.technologies.push("Thymeleaf");
        architecture.components.push({
          type: "frontend",
          framework: "Thymeleaf",
        });
      }
      if (pomContent.includes("h2") || pomContent.includes("H2")) {
        architecture.technologies.push("H2 Database");
        architecture.components.push({
          type: "database",
          technologies: ["H2"],
        });
      }
      if (pomContent.includes("mysql")) {
        architecture.technologies.push("MySQL");
        architecture.components.push({
          type: "database",
          technologies: ["MySQL"],
        });
      }
      if (pomContent.includes("postgresql")) {
        architecture.technologies.push("PostgreSQL");
        architecture.components.push({
          type: "database",
          technologies: ["PostgreSQL"],
        });
      }
    }

    // Analyze Java files to find controllers, services, repositories
    const javaFiles = allFiles.filter((f) => f.name.endsWith(".java"));

    this.log(`🔍 Scanning ${javaFiles.length} Java files...`);

    for (const file of javaFiles) {
      // Scan ALL Java files, not just first 50
      const fileName = file.name.replace(".java", "");
      const filePath = file.path ? file.path.toLowerCase() : "";

      // More aggressive pattern matching
      if (
        fileName.toLowerCase().includes("controller") ||
        filePath.includes("/controller/") ||
        filePath.includes("\\controller\\")
      ) {
        architecture.layers.controllers.push(fileName);
        this.log(`   ✓ Controller: ${fileName}`);
      } else if (
        fileName.toLowerCase().includes("service") ||
        filePath.includes("/service/") ||
        filePath.includes("\\service\\")
      ) {
        architecture.layers.services.push(fileName);
        this.log(`   ✓ Service: ${fileName}`);
      } else if (
        fileName.toLowerCase().includes("repository") ||
        fileName.toLowerCase().includes("repo") ||
        fileName.toLowerCase().includes("dao") ||
        filePath.includes("/repository/") ||
        filePath.includes("\\repository\\") ||
        filePath.includes("/dao/") ||
        filePath.includes("\\dao\\")
      ) {
        architecture.layers.repositories.push(fileName);
        this.log(`   ✓ Repository: ${fileName}`);
      } else if (
        fileName.toLowerCase().includes("model") ||
        fileName.toLowerCase().includes("entity") ||
        filePath.includes("/model/") ||
        filePath.includes("\\model\\") ||
        filePath.includes("/entity/") ||
        filePath.includes("\\entity\\")
      ) {
        architecture.layers.models.push(fileName);
      } else if (
        fileName.toLowerCase().includes("config") ||
        filePath.includes("/config/") ||
        filePath.includes("\\config\\")
      ) {
        architecture.layers.config.push(fileName);
      }
    }

    this.log(
      `✅ Found: ${architecture.layers.controllers.length} controllers, ${architecture.layers.services.length} services, ${architecture.layers.repositories.length} repositories`,
    );
    this.log("📋 Controllers:", architecture.layers.controllers);
    this.log("📋 Services:", architecture.layers.services);
    this.log("📋 Repositories:", architecture.layers.repositories);

    // Detect infrastructure
    if (allFiles.some((f) => f.name === "Dockerfile")) {
      architecture.infrastructure.push("Docker");
    }
    if (allFiles.some((f) => f.name.includes("docker-compose"))) {
      architecture.infrastructure.push("Docker Compose");
    }
    if (
      allFiles.some(
        (f) => f.name.includes("kubernetes") || f.name.includes("k8s"),
      )
    ) {
      architecture.infrastructure.push("Kubernetes");
    }
    if (allFiles.some((f) => f.name === "Jenkinsfile")) {
      architecture.infrastructure.push("Jenkins");
    }

    return architecture;
  }

  async analyzeNodeJSProject(owner, repo, allFiles, fileContents) {
    this.log("📦 Analyzing Node.js project structure...");

    const architecture = {
      packageInfo: {},
      components: [],
      layers: {
        routes: [],
        controllers: [],
        services: [],
        models: [],
        middleware: [],
      },
      technologies: ["JavaScript", "Node.js"],
      infrastructure: [],
      patterns: [],
    };

    // Parse package.json
    if (fileContents["package.json"]) {
      try {
        const pkg = JSON.parse(fileContents["package.json"]);
        architecture.packageInfo = {
          name: pkg.name,
          version: pkg.version,
          dependencies: Object.keys(pkg.dependencies || {}),
        };

        // Detect frameworks and technologies
        const deps = pkg.dependencies || {};
        if (deps.express) {
          architecture.technologies.push("Express");
          architecture.components.push({
            type: "backend",
            framework: "Express",
          });
        }
        if (deps.react) {
          architecture.technologies.push("React");
          architecture.components.push({
            type: "frontend",
            framework: "React",
          });
        }
        if (deps.vue) {
          architecture.technologies.push("Vue");
          architecture.components.push({ type: "frontend", framework: "Vue" });
        }
        if (deps.mongoose) {
          architecture.technologies.push("MongoDB");
          architecture.components.push({
            type: "database",
            technologies: ["MongoDB"],
          });
        }
        if (deps.pg) {
          architecture.technologies.push("PostgreSQL");
          architecture.components.push({
            type: "database",
            technologies: ["PostgreSQL"],
          });
        }
        if (deps.mysql || deps.mysql2) {
          architecture.technologies.push("MySQL");
          architecture.components.push({
            type: "database",
            technologies: ["MySQL"],
          });
        }
        if (deps.redis) {
          architecture.technologies.push("Redis");
        }
      } catch (error) {
        this.logError("Failed to parse package.json:", error.message);
      }
    }

    // Analyze JavaScript/TypeScript files
    const jsFiles = allFiles.filter(
      (f) =>
        f.name.endsWith(".js") ||
        f.name.endsWith(".ts") ||
        f.name.endsWith(".jsx") ||
        f.name.endsWith(".tsx"),
    );

    for (const file of jsFiles) {
      const fileName = file.name;
      const filePath = file.path.toLowerCase();
      const normalizedName = fileName.toLowerCase();

      if (
        filePath.includes("/routes/") ||
        filePath.includes("/route/") ||
        normalizedName.includes("route")
      ) {
        architecture.layers.routes.push(fileName);
      } else if (
        filePath.includes("/controllers/") ||
        filePath.includes("/controller/") ||
        normalizedName.includes("controller") ||
        normalizedName.includes("endpoint")
      ) {
        architecture.layers.controllers.push(fileName);
      } else if (
        filePath.includes("/services/") ||
        filePath.includes("/service/") ||
        normalizedName.includes("service") ||
        normalizedName.includes("manager") ||
        normalizedName.includes("handler")
      ) {
        architecture.layers.services.push(fileName);
      } else if (
        filePath.includes("/repositories/") ||
        filePath.includes("/repository/") ||
        filePath.includes("/repos/") ||
        filePath.includes("/dao/") ||
        normalizedName.includes("repository") ||
        normalizedName.includes("repo") ||
        normalizedName.includes("dao") ||
        normalizedName.includes("store")
      ) {
        architecture.layers.repositories =
          architecture.layers.repositories || [];
        architecture.layers.repositories.push(fileName);
      } else if (
        filePath.includes("/models/") ||
        filePath.includes("/model/") ||
        normalizedName.includes("model") ||
        normalizedName.includes("entity")
      ) {
        architecture.layers.models.push(fileName);
      } else if (
        filePath.includes("/middleware/") ||
        normalizedName.includes("middleware")
      ) {
        architecture.layers.middleware.push(fileName);
      }
    }

    this.log(
      `✅ Found: ${architecture.layers.routes.length} routes, ${architecture.layers.controllers.length} controllers, ${architecture.layers.services.length} services, ${(architecture.layers.repositories || []).length} repositories`,
    );

    // Detect infrastructure
    if (allFiles.some((f) => f.name === "Dockerfile")) {
      architecture.infrastructure.push("Docker");
    }
    if (allFiles.some((f) => f.name.includes("docker-compose"))) {
      architecture.infrastructure.push("Docker Compose");
    }

    return architecture;
  }

  async analyzePythonProject(owner, repo, allFiles, fileContents) {
    this.log("🐍 Analyzing Python project structure...");

    const architecture = {
      packageInfo: {},
      components: [],
      layers: {
        views: [],
        models: [],
        services: [],
        utils: [],
      },
      technologies: ["Python"],
      infrastructure: [],
      patterns: [],
    };

    // Parse requirements.txt
    if (fileContents["requirements.txt"]) {
      const requirements = fileContents["requirements.txt"]
        .split("\n")
        .filter((line) => line.trim());
      architecture.packageInfo = {
        name: "python-project",
        dependencies: requirements.slice(0, 20),
      };

      // Detect frameworks
      const reqText = fileContents["requirements.txt"].toLowerCase();
      if (reqText.includes("django")) {
        architecture.technologies.push("Django");
        architecture.components.push({ type: "backend", framework: "Django" });
      }
      if (reqText.includes("flask")) {
        architecture.technologies.push("Flask");
        architecture.components.push({ type: "backend", framework: "Flask" });
      }
      if (reqText.includes("fastapi")) {
        architecture.technologies.push("FastAPI");
        architecture.components.push({ type: "backend", framework: "FastAPI" });
      }
    }

    // Analyze Python files
    const pyFiles = allFiles.filter((f) => f.name.endsWith(".py"));

    for (const file of pyFiles.slice(0, 50)) {
      const fileName = file.name;
      const filePath = file.path.toLowerCase();

      if (filePath.includes("/views/") || fileName.includes("view")) {
        architecture.layers.views.push(fileName);
      } else if (filePath.includes("/models/") || fileName.includes("model")) {
        architecture.layers.models.push(fileName);
      } else if (
        filePath.includes("/services/") ||
        fileName.includes("service")
      ) {
        architecture.layers.services.push(fileName);
      } else if (filePath.includes("/utils/") || fileName.includes("util")) {
        architecture.layers.utils.push(fileName);
      }
    }

    this.log(
      `✅ Found: ${architecture.layers.views.length} views, ${architecture.layers.models.length} models`,
    );

    return architecture;
  }

  async fetchRepoInfo(owner, repo) {
    try {
      const response = await axios.get(
        `${this.apiBase}/repos/${owner}/${repo}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Enterprise-AI-SDLC-CoPilot",
          },
        },
      );
      this.log(`📊 Repository language detected: ${response.data.language}`);
      return response.data;
    } catch (error) {
      this.logError("Failed to fetch repo info:", error.message);
      return { description: "", language: "Unknown" };
    }
  }

  identifyKeyFiles(contents) {
    const keyFilePatterns = [
      "package.json",
      "pom.xml",
      "build.gradle",
      "Dockerfile",
      "docker-compose.yml",
      "docker-compose.yaml",
      "Jenkinsfile",
      "kubernetes.yaml",
      "k8s.yaml",
      "nginx.conf",
      "requirements.txt",
      "go.mod",
      "Cargo.toml",
    ];

    return contents
      .filter((item) => item.type === "file")
      .filter((item) =>
        keyFilePatterns.some((pattern) =>
          item.name.toLowerCase().includes(pattern.toLowerCase()),
        ),
      )
      .map((item) => ({
        name: item.name,
        path: item.path,
        type: this.categorizeFile(item.name),
      }));
  }

  categorizeFile(filename) {
    const categories = {
      "package.json": "nodejs",
      "pom.xml": "java",
      "build.gradle": "java",
      Dockerfile: "container",
      "docker-compose": "orchestration",
      Jenkinsfile: "ci-cd",
      kubernetes: "orchestration",
      k8s: "orchestration",
      nginx: "proxy",
      "requirements.txt": "python",
      "go.mod": "golang",
      "Cargo.toml": "rust",
    };

    for (const [key, value] of Object.entries(categories)) {
      if (filename.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return "config";
  }

  async fetchKeyFileContents(owner, repo, keyFiles, branch = null) {
    const contents = {};

    for (const file of keyFiles.slice(0, 10)) {
      // Limit to 10 files
      const content = await this.fetchFileContent(
        owner,
        repo,
        file.path,
        branch,
      );
      if (content) {
        contents[file.name] = content;
      }
    }

    return contents;
  }

  inferArchitecture(fileContents, rootContents) {
    const architecture = {
      packageInfo: {},
      components: [],
      technologies: [],
      infrastructure: [],
    };

    // Analyze pom.xml (Java/Maven projects) FIRST
    if (fileContents["pom.xml"]) {
      this.log("📦 Detected Maven/Spring Boot project");
      try {
        const pomContent = fileContents["pom.xml"];

        // Extract dependencies from pom.xml
        const dependencies = [];
        const depMatches = pomContent.matchAll(
          /<artifactId>(.*?)<\/artifactId>/g,
        );
        for (const match of depMatches) {
          dependencies.push(match[1]);
        }

        architecture.packageInfo = {
          name: "spring-project",
          type: "maven",
          dependencies: dependencies.slice(0, 20),
        };

        // Detect Spring Boot
        if (pomContent.includes("spring-boot")) {
          architecture.components.push({
            type: "backend",
            framework: "Spring Boot",
          });
          architecture.technologies.push("Spring Boot");
        }

        // Detect databases
        if (pomContent.includes("h2") || pomContent.includes("H2")) {
          architecture.components.push({
            type: "database",
            technologies: ["H2"],
          });
        }
        if (pomContent.includes("mysql")) {
          architecture.components.push({
            type: "database",
            technologies: ["MySQL"],
          });
        }

        // Detect Thymeleaf
        if (pomContent.includes("thymeleaf")) {
          architecture.components.push({
            type: "frontend",
            framework: "Thymeleaf",
          });
        }
      } catch (error) {
        this.logError("Failed to parse pom.xml:", error.message);
      }
    }
    // Analyze package.json
    else if (fileContents["package.json"]) {
      try {
        const pkg = JSON.parse(fileContents["package.json"]);
        architecture.packageInfo = {
          name: pkg.name,
          version: pkg.version,
          dependencies: Object.keys(pkg.dependencies || {}),
          devDependencies: Object.keys(pkg.devDependencies || {}),
        };

        // Detect frontend frameworks
        if (
          pkg.dependencies?.react ||
          pkg.dependencies?.["@angular/core"] ||
          pkg.dependencies?.vue
        ) {
          architecture.components.push({
            type: "frontend",
            framework: this.detectFrontendFramework(pkg.dependencies),
          });
        }

        // Detect backend frameworks
        if (
          pkg.dependencies?.express ||
          pkg.dependencies?.koa ||
          pkg.dependencies?.fastify
        ) {
          architecture.components.push({
            type: "backend",
            framework: this.detectBackendFramework(pkg.dependencies),
          });
        }

        // Detect databases
        const dbLibs = ["mongoose", "pg", "mysql", "redis", "mongodb"];
        const detectedDbs = dbLibs.filter((lib) => pkg.dependencies?.[lib]);
        if (detectedDbs.length > 0) {
          architecture.components.push({
            type: "database",
            technologies: detectedDbs,
          });
        }
      } catch (error) {
        this.logError("Failed to parse package.json:", error.message);
      }
    }

    // Analyze Docker
    if (fileContents["Dockerfile"] || fileContents["docker-compose.yml"]) {
      architecture.infrastructure.push("Docker");
      architecture.components.push({ type: "container", technology: "Docker" });
    }

    // Analyze Kubernetes
    const hasK8s = rootContents.some(
      (item) => item.name.includes("kubernetes") || item.name.includes("k8s"),
    );
    if (hasK8s) {
      architecture.infrastructure.push("Kubernetes");
      architecture.components.push({
        type: "orchestration",
        technology: "Kubernetes",
      });
    }

    // Analyze CI/CD
    if (fileContents["Jenkinsfile"]) {
      architecture.infrastructure.push("Jenkins");
    }

    const hasGithubActions = rootContents.some(
      (item) => item.name === ".github",
    );
    if (hasGithubActions) {
      architecture.infrastructure.push("GitHub Actions");
    }

    return architecture;
  }

  detectFrontendFramework(dependencies) {
    if (dependencies.react) return "React";
    if (dependencies["@angular/core"]) return "Angular";
    if (dependencies.vue) return "Vue";
    return "Unknown";
  }

  detectBackendFramework(dependencies) {
    if (dependencies.express) return "Express";
    if (dependencies.koa) return "Koa";
    if (dependencies.fastify) return "Fastify";
    if (dependencies.nestjs) return "NestJS";
    return "Node.js";
  }

  async analyzeFileRelationships(owner, repo, allFiles) {
    this.log("🔗 Analyzing file relationships and dependencies...");
    const relationships = [];
    const fileMap = new Map();

    // Create a map of files for quick lookup
    allFiles.forEach((file) => {
      fileMap.set(file.path, file);
    });

    // Analyze key files for relationships (limit to avoid rate limits)
    // Filter out configuration and build files
    const filesToAnalyze = allFiles
      .filter(
        (f) =>
          (f.name.endsWith(".js") ||
            f.name.endsWith(".ts") ||
            f.name.endsWith(".jsx") ||
            f.name.endsWith(".tsx") ||
            f.name.endsWith(".java") ||
            f.name.endsWith(".py")) &&
          // Exclude config files
          !f.name.includes("config") &&
          !f.name.includes("Config") &&
          !f.name.includes(".config.") &&
          !f.path.includes("/config/") &&
          !f.path.includes("\\config\\") &&
          // Exclude build/test files
          !f.name.includes(".test.") &&
          !f.name.includes(".spec.") &&
          !f.path.includes("/test/") &&
          !f.path.includes("\\test\\") &&
          !f.path.includes("/tests/") &&
          !f.path.includes("\\tests\\") &&
          // Exclude node_modules and build dirs
          !f.path.includes("node_modules") &&
          !f.path.includes("/build/") &&
          !f.path.includes("\\build\\") &&
          !f.path.includes("/dist/") &&
          !f.path.includes("\\dist\\") &&
          // Focus on application code
          (f.path.includes("/controller") ||
            f.path.includes("\\controller") ||
            f.path.includes("/service") ||
            f.path.includes("\\service") ||
            f.path.includes("/repository") ||
            f.path.includes("\\repository") ||
            f.path.includes("/model") ||
            f.path.includes("\\model") ||
            f.path.includes("/entity") ||
            f.path.includes("\\entity") ||
            f.name.toLowerCase().includes("controller") ||
            f.name.toLowerCase().includes("service") ||
            f.name.toLowerCase().includes("repository") ||
            f.name.toLowerCase().includes("model") ||
            f.name.toLowerCase().includes("entity")),
      )
      .slice(0, 30); // Limit to 30 files to avoid API rate limits

    for (const file of filesToAnalyze) {
      try {
        const content = await this.fetchFileContent(owner, repo, file.path);
        if (content) {
          const fileRelationships = this.extractRelationships(
            file,
            content,
            fileMap,
          );
          relationships.push(...fileRelationships);
        }
      } catch (error) {
        this.logError(`Failed to analyze ${file.path}:`, error.message);
      }
    }

    this.log(`✅ Found ${relationships.length} file relationships`);
    return relationships;
  }

  extractRelationships(sourceFile, content, fileMap) {
    const relationships = [];

    // Extract method calls and service injections for Java
    if (sourceFile.name.endsWith(".java")) {
      // Extract class name
      const classMatch = content.match(/class\s+(\w+)/);
      const className = classMatch
        ? classMatch[1]
        : sourceFile.name.replace(".java", "");

      // Extract @Autowired or injected services
      const autowiredMatches = content.matchAll(
        /@Autowired[\s\S]*?private\s+(\w+)\s+(\w+);/g,
      );
      for (const match of autowiredMatches) {
        const serviceType = match[1];
        const serviceName = match[2];
        relationships.push({
          source: sourceFile.path,
          sourceClass: className,
          target: serviceType,
          targetType: "service_injection",
          type: "autowired",
          statement: `@Autowired ${serviceType} ${serviceName}`,
        });
      }

      // Extract method calls (serviceName.methodName())
      const methodCallMatches = content.matchAll(/(\w+)\.(\w+)\(/g);
      for (const match of methodCallMatches) {
        const objectName = match[1];
        const methodName = match[2];

        // Skip common Java methods
        if (
          ![
            "System",
            "String",
            "Integer",
            "Long",
            "Double",
            "Boolean",
            "List",
            "Set",
            "Map",
            "Optional",
          ].includes(objectName)
        ) {
          relationships.push({
            source: sourceFile.path,
            sourceClass: className,
            target: objectName,
            targetMethod: methodName,
            type: "method_call",
            statement: `${objectName}.${methodName}()`,
          });
        }
      }

      // Extract @RequestMapping or @GetMapping/@PostMapping endpoints
      const mappingMatches = content.matchAll(
        /@(?:Request|Get|Post|Put|Delete)Mapping\s*\(\s*["']([^"']+)["']/g,
      );
      for (const match of mappingMatches) {
        const endpoint = match[1];
        relationships.push({
          source: "HTTP",
          target: sourceFile.path,
          targetClass: className,
          endpoint: endpoint,
          type: "http_endpoint",
          statement: `Endpoint: ${endpoint}`,
        });
      }
    }

    // Extract imports/requires for JavaScript/TypeScript
    if (sourceFile.name.match(/\.(js|ts|jsx|tsx)$/)) {
      // ES6 imports: import X from 'path'
      const es6Imports = content.matchAll(
        /import\s+.*?\s+from\s+['"](.+?)['"]/g,
      );
      for (const match of es6Imports) {
        relationships.push({
          source: sourceFile.path,
          target: this.resolveImportPath(match[1], sourceFile.path),
          type: "import",
          statement: match[0],
        });
      }

      // CommonJS requires: require('path')
      const requireImports = content.matchAll(
        /require\s*\(\s*['"](.+?)['"]\s*\)/g,
      );
      for (const match of requireImports) {
        relationships.push({
          source: sourceFile.path,
          target: this.resolveImportPath(match[1], sourceFile.path),
          type: "require",
          statement: match[0],
        });
      }
    }

    // Extract imports for Java
    if (sourceFile.name.endsWith(".java")) {
      const javaImports = content.matchAll(/import\s+([\w.]+);/g);
      for (const match of javaImports) {
        relationships.push({
          source: sourceFile.path,
          target: match[1],
          type: "import",
          statement: match[0],
        });
      }
    }

    // Extract imports for Python
    if (sourceFile.name.endsWith(".py")) {
      // from X import Y
      const pythonFromImports = content.matchAll(/from\s+([\w.]+)\s+import/g);
      for (const match of pythonFromImports) {
        relationships.push({
          source: sourceFile.path,
          target: match[1],
          type: "import",
          statement: match[0],
        });
      }

      // import X
      const pythonImports = content.matchAll(/^import\s+([\w.]+)/gm);
      for (const match of pythonImports) {
        relationships.push({
          source: sourceFile.path,
          target: match[1],
          type: "import",
          statement: match[0],
        });
      }
    }

    return relationships;
  }

  resolveImportPath(importPath, sourceFilePath) {
    // Handle relative imports
    if (importPath.startsWith("./") || importPath.startsWith("../")) {
      const sourceParts = sourceFilePath.split("/");
      sourceParts.pop(); // Remove filename

      const importParts = importPath.split("/");
      for (const part of importParts) {
        if (part === "..") {
          sourceParts.pop();
        } else if (part !== ".") {
          sourceParts.push(part);
        }
      }

      return sourceParts.join("/");
    }

    // Return as-is for absolute or package imports
    return importPath;
  }

  buildDependencyGraph(allFiles, relationships) {
    this.log("📊 Building dependency graph...");
    const graph = {
      nodes: [],
      edges: [],
      clusters: {},
    };

    // Create nodes for each file
    allFiles.forEach((file) => {
      const folder = file.path.split("/").slice(0, -1).join("/") || "root";

      if (!graph.clusters[folder]) {
        graph.clusters[folder] = [];
      }

      graph.clusters[folder].push({
        id: file.path,
        name: file.name,
        type: file.type,
        path: file.path,
      });

      graph.nodes.push({
        id: file.path,
        label: file.name,
        type: file.type,
        folder: folder,
      });
    });

    relationships.forEach((rel) => {
      graph.edges.push({
        source: rel.source,
        target: rel.target,
        type: rel.type,
      });
    });

    this.log(
      `✅ Graph built: ${graph.nodes.length} nodes, ${graph.edges.length} edges, ${Object.keys(graph.clusters).length} folders`,
    );
    return graph;
  }
}

export default new GitHubAnalyzer();

// Made with Bob
