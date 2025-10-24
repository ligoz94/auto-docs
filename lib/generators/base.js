import OpenAI from 'openai';
import simpleGit from 'simple-git';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import chalk from 'chalk';

const git = simpleGit();

/**
 * Base generator class with common functionality
 * Framework-specific generators extend this class
 */
export class BaseGenerator {
  constructor(config) {
    this.config = config;
    this.docsPath = config.documentation?.docsPath || 'docs';

    // Initialize OpenAI client based on provider
    this.initializeAIClient();
  }

  /**
   * Initialize AI client based on provider
   */
  initializeAIClient() {
    const { provider, apiKey, model } = this.config.ai;

    if (provider === 'openrouter') {
      this.aiClient = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey || process.env.OPENROUTER_API_KEY,
        defaultHeaders: {
          'HTTP-Referer': process.env.GITHUB_REPOSITORY || 'https://github.com',
          'X-Title': 'Auto-Docs Framework'
        }
      });
    } else if (provider === 'openai') {
      this.aiClient = new OpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY
      });
    } else if (provider === 'anthropic') {
      // Anthropic uses different SDK, but OpenAI SDK can work with compatible endpoints
      this.aiClient = new OpenAI({
        baseURL: 'https://api.anthropic.com/v1',
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY
      });
    }
  }

  /**
   * Analyze code changes from git
   * @param {Object} options - Analysis options
   * @returns {Promise<Array>} Changed files with diffs
   */
  async analyze(options = {}) {
    const { baseBranch = 'main', force = false } = options;

    try {
      // Get current branch
      const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);

      // Get diff
      let diffSummary;
      if (force) {
        // Get all files
        diffSummary = await git.diff(['--name-status', baseBranch]);
      } else {
        // Get changes since last successful docs generation
        const tracking = this.loadTracking();
        const lastCommit = tracking?.lastProcessedCommit;

        if (lastCommit) {
          diffSummary = await git.diff(['--name-status', `${lastCommit}..HEAD`]);
        } else {
          diffSummary = await git.diff(['--name-status', baseBranch]);
        }
      }

      if (!diffSummary) {
        return [];
      }

      // Parse diff and get detailed changes
      const lines = diffSummary.split('\n').filter(Boolean);
      const changes = [];

      for (const line of lines) {
        const [status, ...pathParts] = line.split('\t');
        const filePath = pathParts.join('\t');

        // Skip files that match exclude patterns
        if (this.shouldExclude(filePath)) {
          continue;
        }

        // Get file diff
        const diff = await git.diff([baseBranch, '--', filePath]);

        changes.push({
          path: filePath,
          status,
          diff
        });
      }

      return changes;

    } catch (error) {
      console.error(chalk.red('Error analyzing changes:'), error);
      return [];
    }
  }

  /**
   * Check if file should be excluded
   * @param {string} filePath - File path to check
   * @returns {boolean} True if should exclude
   */
  shouldExclude(filePath) {
    const excludePatterns = this.config.triggers?.excludePatterns || [
      'node_modules/**',
      'dist/**',
      'build/**',
      'docs/**',
      '**/*.test.*',
      '**/*.spec.*'
    ];

    return excludePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace('**', '.*').replace('*', '[^/]*'));
      return regex.test(filePath);
    });
  }

  /**
   * Generate documentation using AI
   * @param {Object} options - Generation options
   * @returns {Promise<void>}
   */
  async generate(options = {}) {
    const { audience, changes, dryRun = false } = options;

    if (!changes || changes.length === 0) {
      console.log(chalk.blue('No changes to document'));
      return;
    }

    console.log(chalk.blue(`\nGenerating docs for ${audience}...`));
    console.log(chalk.gray(`Processing ${changes.length} file(s)\n`));

    // Get audience-specific prompt
    const prompt = this.getAudiencePrompt(audience);

    // Prepare context from changes
    const context = this.prepareContext(changes);

    // Call AI to generate documentation
    const documentation = await this.generateWithAI(prompt, context);

    if (!documentation) {
      console.log(chalk.yellow('No documentation generated'));
      return;
    }

    // Parse and organize documentation
    const pages = this.parseDocumentation(documentation, audience);

    if (dryRun) {
      console.log(chalk.blue('\n=== DRY RUN - Preview ===\n'));
      console.log(documentation);
      return;
    }

    // Write documentation files
    await this.writeDocumentation(pages, audience);

    // Update configuration (framework-specific)
    await this.updateConfig(pages, audience);

    // Update tracking
    this.updateTracking(changes);

    console.log(chalk.green(`\n✅ Documentation generated for ${audience}`));
  }

  /**
   * Get audience-specific system prompt
   * @param {string} audience - Target audience
   * @returns {string} System prompt
   */
  getAudiencePrompt(audience) {
    const prompts = {
      developer: `You are an expert technical documentation writer for developers.

Create detailed, precise technical documentation including:
- API references with parameters and return types
- Code examples in multiple languages
- Error handling and edge cases
- Performance and security considerations
- Best practices and patterns

Use technical language and include implementation details.`,

      stakeholder: `You are a business documentation expert.

Create high-level, strategic documentation including:
- Business value and impact
- Key features and capabilities
- Metrics and KPIs
- ROI and cost implications
- Risk assessment

Use business language, avoid technical jargon, focus on outcomes.`,

      customer: `You are a user experience documentation writer.

Create clear, friendly user guides including:
- Step-by-step tutorials
- Common use cases
- Troubleshooting guides
- FAQs
- Visual examples

Use simple language, focus on tasks and goals, be encouraging.`
    };

    return prompts[audience] || prompts.developer;
  }

  /**
   * Prepare context from code changes
   * @param {Array} changes - Changed files
   * @returns {Object} Context object
   */
  prepareContext(changes) {
    const context = {
      filesChanged: changes.length,
      changes: changes.map(c => ({
        file: c.path,
        status: c.status,
        diff: c.diff.substring(0, 2000) // Limit diff size
      }))
    };

    return context;
  }

  /**
   * Generate documentation using AI
   * @param {string} systemPrompt - System prompt
   * @param {Object} context - Context object
   * @returns {Promise<string>} Generated documentation
   */
  async generateWithAI(systemPrompt, context) {
    try {
      const userPrompt = `Analyze these code changes and generate documentation.

Files changed: ${context.filesChanged}

Changes:
${context.changes.map(c => `
File: ${c.file} (${c.status})
Diff:
\`\`\`diff
${c.diff}
\`\`\`
`).join('\n')}

Generate comprehensive documentation in MDX format.`;

      const response = await this.aiClient.chat.completions.create({
        model: this.config.ai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: this.config.ai.temperature || 0.3,
        max_tokens: this.config.ai.maxTokens || 4000
      });

      return response.choices[0]?.message?.content || '';

    } catch (error) {
      console.error(chalk.red('AI generation error:'), error.message);
      return null;
    }
  }

  /**
   * Parse AI-generated documentation into pages
   * @param {string} documentation - Raw documentation
   * @param {string} audience - Target audience
   * @returns {Array} Array of page objects
   */
  parseDocumentation(documentation, audience) {
    // Simple parsing - split by headers or use single page
    // Override in framework-specific generators for custom logic

    const pages = [{
      title: 'Auto-Generated Documentation',
      content: documentation,
      audience
    }];

    return pages;
  }

  /**
   * Write documentation to files
   * @param {Array} pages - Pages to write
   * @param {string} audience - Target audience
   */
  async writeDocumentation(pages, audience) {
    const audienceDir = join(process.cwd(), this.docsPath, audience);

    // Ensure directory exists
    if (!existsSync(audienceDir)) {
      mkdirSync(audienceDir, { recursive: true });
    }

    for (const page of pages) {
      const fileName = this.sanitizeFileName(page.title) + '.mdx';
      const filePath = join(audienceDir, fileName);

      // Add frontmatter
      const content = matter.stringify(page.content, {
        title: page.title,
        description: page.description || `Documentation for ${page.title}`
      });

      writeFileSync(filePath, content);
      console.log(chalk.gray(`  ✓ Created ${fileName}`));
    }
  }

  /**
   * Sanitize file name
   * @param {string} title - Page title
   * @returns {string} Sanitized file name
   */
  sanitizeFileName(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Load tracking data
   * @returns {Object|null} Tracking data
   */
  loadTracking() {
    const trackingPath = join(process.cwd(), '.docs-tracking.json');

    if (existsSync(trackingPath)) {
      try {
        return JSON.parse(readFileSync(trackingPath, 'utf-8'));
      } catch (error) {
        return null;
      }
    }

    return null;
  }

  /**
   * Update tracking data
   * @param {Array} changes - Processed changes
   */
  async updateTracking(changes) {
    const trackingPath = join(process.cwd(), '.docs-tracking.json');

    // Get latest commit
    const latestCommit = await git.revparse(['HEAD']);

    const tracking = {
      lastProcessedCommit: latestCommit,
      lastUpdate: new Date().toISOString(),
      filesProcessed: changes.length
    };

    writeFileSync(trackingPath, JSON.stringify(tracking, null, 2));
  }

  // Framework-specific methods (to be overridden)
  formatContent(content, metadata) {
    throw new Error('formatContent() must be implemented by subclass');
  }

  updateConfig(pages, audience) {
    throw new Error('updateConfig() must be implemented by subclass');
  }

  generateNavigation(pages) {
    throw new Error('generateNavigation() must be implemented by subclass');
  }
}
