import { copyFileSync, mkdirSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import fse from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Copy template files for a specific framework
 * @param {string} framework - Framework name
 * @param {Object} config - Configuration options
 */
export async function copyTemplates(framework, config) {
  const templatesDir = join(__dirname, '../templates', framework);
  const targetDir = process.cwd();

  if (!existsSync(templatesDir)) {
    throw new Error(`Templates not found for framework: ${framework}`);
  }

  // Copy template directory recursively
  copyRecursive(templatesDir, targetDir, config);

  // Copy GitHub Actions if enabled
  if (config.setupGitHubActions) {
    const workflowSource = join(templatesDir, `.github/workflows/auto-docs-${framework}.yml`);
    const workflowTarget = join(targetDir, '.github/workflows');

    if (existsSync(workflowSource)) {
      mkdirSync(workflowTarget, { recursive: true });
      copyFileSync(workflowSource, join(workflowTarget, `auto-docs.yml`));
    }
  }

  // Create docs directories for multi-audience
  if (config.multiAudience && config.audiences) {
    const docsPath = config.documentation?.docsPath || 'docs';

    for (const audience of config.audiences) {
      const audienceDir = join(targetDir, docsPath, audience);
      mkdirSync(audienceDir, { recursive: true });

      // Create initial introduction page
      const introContent = generateIntroPage(audience, framework);
      writeFileSync(
        join(audienceDir, 'introduction.mdx'),
        introContent
      );
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
    if (file === '.github' && !config.setupGitHubActions) {
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
      copyFileSync(sourcePath, targetPath);
    }
  }
}

/**
 * Install framework-specific dependencies
 * @param {string} framework - Framework name
 */
export async function installDependencies(framework) {
  // Common dependencies for all frameworks
  const commonDeps = [
    '@ligoz94/auto-docs@latest'
  ];

  const dependencies = {
    mintlify: [],
    docusaurus: [
      '@docusaurus/core@latest',
      '@docusaurus/preset-classic@latest',
      'react@^18.0.0',
      'react-dom@^18.0.0'
    ],
    vitepress: [
      'vitepress@latest',
      'vue@^3.0.0'
    ]
  };

  const frameworkDeps = dependencies[framework] || [];
  const allDeps = [...commonDeps, ...frameworkDeps];

  if (allDeps.length > 0) {
    try {
      console.log(`Installing dependencies...`);
      execSync(`npm install -D ${allDeps.join(' ')}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      console.error(`Failed to install dependencies`);
      throw error;
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
        configFile: 'mint.json',
        docsPath: 'docs',
        dev: 'npx mintlify dev',
        build: 'npx mintlify build'
      },
      docusaurus: {
        configFile: 'docusaurus.config.js',
        docsPath: 'docs',
        dev: 'npm run start',
        build: 'npm run build'
      },
      vitepress: {
        configFile: '.vitepress/config.js',
        docsPath: 'docs',
        dev: 'npm run docs:dev',
        build: 'npm run docs:build'
      }
    },

    multiAudience: {
      enabled: options.multiAudience || false,
      audiences: options.audiences || ['developer']
    },

    ai: {
      provider: options.aiProvider || 'openrouter',
      model: options.aiModel || 'openai/gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 4000
    },

    documentation: {
      docsPath: 'docs',
      format: 'mdx',
      language: 'en',
      style: {
        tone: 'technical',
        complexity: 'intermediate',
        includeExamples: true
      }
    },

    triggers: {
      filePatterns: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.py'
      ],
      excludePatterns: [
        'node_modules/**',
        'dist/**',
        'build/**',
        'docs/**',
        '**/*.test.*',
        '**/*.spec.*'
      ]
    },

    output: {
      createPR: true,
      prBranch: 'docs/auto-pr-{number}',
      prTitle: '📚 [Auto] Documentation for PR #{number}',
      addLabels: ['documentation', 'automated', 'ai-generated']
    }
  };

  writeFileSync(
    join(process.cwd(), '.doc-agent-config.json'),
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
    developer: 'Developer Documentation',
    stakeholder: 'Business Overview',
    customer: 'User Guide'
  };

  const descriptions = {
    developer: 'Technical documentation, API reference, and implementation guides.',
    stakeholder: 'High-level overview, metrics, and business value.',
    customer: 'End-user guides, tutorials, and how-to articles.'
  };

  return `---
title: ${titles[audience] || 'Documentation'}
description: ${descriptions[audience] || 'Welcome to the documentation'}
---

# ${titles[audience] || 'Documentation'}

${descriptions[audience] || 'Welcome to the documentation'}

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
