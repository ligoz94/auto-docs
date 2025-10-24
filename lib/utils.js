import {
  copyFileSync,
  mkdirSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
  readFileSync,
} from "fs";
import { join, dirname } from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import fse from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Copy template files for a specific framework
 * @param {string} framework - Framework name
 * @param {Object} config - Configuration options
 */
export async function copyTemplates(framework, config) {
  const templatesDir = join(__dirname, "../templates", framework);
  const targetDir = process.cwd();

  if (!existsSync(templatesDir)) {
    throw new Error(`Templates not found for framework: ${framework}`);
  }

  // Copy template directory recursively
  copyRecursive(templatesDir, targetDir, config);

  // Copy GitHub Actions if enabled
  if (config.setupGitHubActions) {
    const workflowSource = join(
      templatesDir,
      `.github/workflows/auto-docs-${framework}.yml`
    );
    const workflowTarget = join(targetDir, ".github/workflows");

    if (existsSync(workflowSource)) {
      mkdirSync(workflowTarget, { recursive: true });
      copyFileSync(workflowSource, join(workflowTarget, `auto-docs.yml`));
    }
  }

  // Create docs directories for multi-audience
  if (config.multiAudience && config.audiences) {
    const docsPath = config.documentation?.docsPath || "docs";

    for (const audience of config.audiences) {
      const audienceDir = join(targetDir, docsPath, audience);
      mkdirSync(audienceDir, { recursive: true });

      // Create initial introduction page
      const introContent = generateIntroPage(audience, framework);
      writeFileSync(join(audienceDir, "introduction.mdx"), introContent);
    }
  }
}

/**
 * Copy directory recursively
 * @param {string} source - Source directory
 * @param {string} target - Target directory
 * @param {Object} config - Configuration for filtering
 */
function copyRecursive(source, target, config = {}) {
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }

  const files = readdirSync(source);

  for (const file of files) {
    const sourcePath = join(source, file);
    const targetPath = join(target, file);

    // Skip GitHub workflows if not enabled
    if (file === ".github" && !config.setupGitHubActions) {
      continue;
    }

    if (statSync(sourcePath).isDirectory()) {
      copyRecursive(sourcePath, targetPath, config);
    } else {
      // Ensure target directory exists
      const targetDir = dirname(targetPath);
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }

      // Special handling for package.json - merge instead of overwrite
      if (file === "package.json" && existsSync(targetPath)) {
        mergePackageJson(sourcePath, targetPath);
      } else {
        copyFileSync(sourcePath, targetPath);
      }
    }
  }
}

/**
 * Merge package.json files intelligently
 * @param {string} sourcePath - Template package.json path
 * @param {string} targetPath - Existing package.json path
 */
function mergePackageJson(sourcePath, targetPath) {
  const templatePkg = JSON.parse(readFileSync(sourcePath, "utf-8"));
  const existingPkg = JSON.parse(readFileSync(targetPath, "utf-8"));

  // Deep merge function
  const deepMerge = (target, source) => {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        // For arrays and primitives, prefer existing values but add new ones
        if (Array.isArray(source[key]) && Array.isArray(target[key])) {
          // Merge arrays, removing duplicates
          result[key] = [...new Set([...target[key], ...source[key]])];
        } else if (!target[key]) {
          // Only add if doesn't exist
          result[key] = source[key];
        }
        // If exists in target, keep the target value
      }
    }
    return result;
  };

  // Merge the packages
  const merged = deepMerge(existingPkg, templatePkg);

  // Write back
  writeFileSync(targetPath, JSON.stringify(merged, null, 2) + "\n");
}

/**
 * Install framework-specific dependencies
 * @param {string} framework - Framework name
 */
export async function installDependencies(framework) {
  const dependencies = {
    mintlify: [],
    docusaurus: [
      "@docusaurus/core@latest",
      "@docusaurus/preset-classic@latest",
      "react@^18.0.0",
      "react-dom@^18.0.0",
    ],
    vitepress: ["vitepress@latest", "vue@^3.0.0"],
  };

  const allDeps = dependencies[framework] || [];

  if (allDeps.length > 0) {
    try {
      console.log(`Installing dependencies...`);
      execSync(`npm install -D ${allDeps.join(" ")}`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log(`✅ Dependencies installed successfully`);
    } catch (error) {
      console.warn(`\n⚠️  Automatic dependency installation failed.`);
      console.warn(`This might be because you're using npm/pnpm workspaces.\n`);
      console.log(`📦 Please install dependencies manually:\n`);
      console.log(`   npm install -D ${allDeps.join(" ")}\n`);
      console.log(`Or if using workspaces:`);
      console.log(`   npm install -D ${allDeps.join(" ")} -w <workspace-name>`);
      console.log(`   # or`);
      console.log(`   pnpm add -D ${allDeps.join(" ")} --filter <workspace-name>\n`);
      // Don't throw error, let setup continue
    }
  }
}

/**
 * Create configuration file
 * @param {Object} options - Configuration options
 */
export async function createConfig(options) {
  const config = {
    framework: options.framework,

    frameworks: {
      mintlify: {
        configFile: "mint.json",
        docsPath: "docs",
        dev: "npx mintlify dev",
        build: "npx mintlify build",
      },
      docusaurus: {
        configFile: "docusaurus.config.js",
        docsPath: "docs",
        dev: "npm run start",
        build: "npm run build",
      },
      vitepress: {
        configFile: ".vitepress/config.js",
        docsPath: "docs",
        dev: "npm run docs:dev",
        build: "npm run docs:build",
      },
    },

    multiAudience: {
      enabled: options.multiAudience || false,
      audiences: options.audiences || ["developer"],
    },

    ai: {
      provider: options.aiProvider || "openrouter",
      model: options.aiModel || "z-ai/glm-4.5-air:free",
      temperature: 0.3,
      maxTokens: 4000,
    },

    documentation: {
      docsPath: "docs",
      format: "mdx",
      language: "en",
      style: {
        tone: "technical",
        complexity: "intermediate",
        includeExamples: true,
      },
    },

    triggers: {
      filePatterns: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.py"],
      excludePatterns: [
        "node_modules/**",
        "dist/**",
        "build/**",
        "docs/**",
        "**/*.test.*",
        "**/*.spec.*",
      ],
    },

    output: {
      createPR: true,
      prBranch: "docs/auto-pr-{number}",
      prTitle: "📚 [Auto] Documentation for PR #{number}",
      addLabels: ["documentation", "automated", "ai-generated"],
    },
  };

  writeFileSync(
    join(process.cwd(), ".doc-agent-config.json"),
    JSON.stringify(config, null, 2)
  );
}

/**
 * Generate initial introduction page for an audience
 * @param {string} audience - Audience name
 * @param {string} framework - Framework name
 * @returns {string} Page content
 */
function generateIntroPage(audience, framework) {
  const titles = {
    developer: "Developer Documentation",
    stakeholder: "Business Overview",
    customer: "User Guide",
  };

  const descriptions = {
    developer:
      "Technical documentation, API reference, and implementation guides.",
    stakeholder: "High-level overview, metrics, and business value.",
    customer: "End-user guides, tutorials, and how-to articles.",
  };

  return `---
title: ${titles[audience] || "Documentation"}
description: ${descriptions[audience] || "Welcome to the documentation"}
---

# ${titles[audience] || "Documentation"}

${descriptions[audience] || "Welcome to the documentation"}

## Getting Started

This documentation is automatically generated from your codebase using AI.

To update this documentation:
1. Make changes to your code
2. Commit and push
3. GitHub Actions will automatically generate updated documentation

## Sections

Documentation will be organized into the following sections:

- **Introduction**: Overview and getting started
- **Guides**: Step-by-step tutorials
- **Reference**: Detailed API and component documentation
`;
}
