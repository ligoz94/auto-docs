#!/usr/bin/env node

import { Command } from 'commander';
import { init } from './init.js';
import { generate } from './generate.js';
import { dev } from './dev.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('auto-docs')
  .description('AI-powered multi-audience documentation generator')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize auto-docs in your project')
  .option('-f, --framework <type>', 'Framework: mintlify, docusaurus, vitepress')
  .option('--skip-install', 'Skip dependency installation')
  .option('--skip-git', 'Skip GitHub Actions setup')
  .action(init);

program
  .command('generate')
  .description('Generate documentation from code changes')
  .option('-a, --audience <type>', 'Target audience: developer, stakeholder, customer, all')
  .option('--force', 'Force regenerate all docs')
  .option('--dry-run', 'Preview without writing files')
  .option('--base-branch <branch>', 'Base branch for comparison', 'main')
  .action(generate);

program
  .command('dev [audience]')
  .description('Start dev server for documentation')
  .option('-p, --port <port>', 'Port number', '3000')
  .action(dev);

program
  .command('config')
  .description('Validate and display configuration')
  .option('--validate', 'Validate configuration file')
  .option('--show', 'Show current configuration')
  .action(async (options) => {
    const { loadConfig } = await import('../lib/config.js');
    const config = await loadConfig();

    if (options.validate) {
      console.log('✅ Configuration is valid');
    }

    if (options.show) {
      console.log(JSON.stringify(config, null, 2));
    }
  });

program.parse();
