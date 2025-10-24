import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

/**
 * Load and validate configuration
 * @returns {Promise<Object>} Configuration object
 */
export async function loadConfig() {
  const configPath = join(process.cwd(), '.doc-agent-config.json');

  if (!existsSync(configPath)) {
    console.error(chalk.red('\n❌ Configuration file not found'));
    console.error(chalk.yellow('Run `npx auto-docs init` to create configuration\n'));
    process.exit(1);
  }

  try {
    const configContent = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    // Validate required fields
    if (!config.framework) {
      throw new Error('Missing required field: framework');
    }

    if (!['mintlify', 'docusaurus', 'vitepress'].includes(config.framework)) {
      throw new Error(`Invalid framework: ${config.framework}. Must be one of: mintlify, docusaurus, vitepress`);
    }

    // Set defaults
    config.documentation = config.documentation || {};
    config.documentation.docsPath = config.documentation.docsPath || 'docs';
    config.documentation.format = config.documentation.format || 'mdx';

    config.ai = config.ai || {};
    config.ai.provider = config.ai.provider || 'openrouter';
    config.ai.temperature = config.ai.temperature !== undefined ? config.ai.temperature : 0.3;
    config.ai.maxTokens = config.ai.maxTokens || 4000;

    config.multiAudience = config.multiAudience || { enabled: false };

    // Load environment variables for API keys (only if not set in config)
    if (!config.ai.apiKey) {
      if (config.ai.provider === 'openrouter') {
        config.ai.apiKey = process.env.OPENROUTER_API_KEY;
      } else if (config.ai.provider === 'openai') {
        config.ai.apiKey = process.env.OPENAI_API_KEY;
      } else if (config.ai.provider === 'anthropic') {
        config.ai.apiKey = process.env.ANTHROPIC_API_KEY;
      }
    }

    return config;

  } catch (error) {
    console.error(chalk.red('\n❌ Failed to load configuration'));
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Validate configuration object
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result with errors
 */
export function validateConfig(config) {
  const errors = [];

  if (!config.framework) {
    errors.push('Missing required field: framework');
  }

  if (!['mintlify', 'docusaurus', 'vitepress'].includes(config.framework)) {
    errors.push(`Invalid framework: ${config.framework}`);
  }

  if (!config.ai?.provider) {
    errors.push('Missing required field: ai.provider');
  }

  if (!config.ai?.model) {
    errors.push('Missing required field: ai.model');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
