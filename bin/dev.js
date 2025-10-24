import { loadConfig } from '../lib/config.js';
import { execSync } from 'child_process';
import chalk from 'chalk';

export async function dev(audience, options) {
  try {
    const config = await loadConfig();

    const framework = config.framework;
    const frameworkConfig = config.frameworks[framework];

    if (!frameworkConfig) {
      console.error(chalk.red(`❌ Framework ${framework} not configured`));
      process.exit(1);
    }

    console.log(chalk.bold.blue(`\n🚀 Starting ${framework} dev server...\n`));

    let devCommand = frameworkConfig.dev;

    // Add port if specified (default 3000)
    const port = options.port || '3000';
    if (framework !== 'mintlify') {
      if (framework === 'docusaurus') {
        devCommand += ` --port ${port}`;
      } else if (framework === 'vitepress') {
        devCommand += ` --port ${port}`;
      }
    }

    // For multi-audience, user can specify which audience
    if (audience && config.multiAudience?.enabled) {
      console.log(chalk.blue(`📖 Viewing ${audience} documentation\n`));

      if (framework === 'mintlify') {
        // Mintlify uses tabs, so just start main server
        execSync(devCommand, { stdio: 'inherit' });
      } else {
        // For Docusaurus/VitePress, navigate to specific audience dir if structure supports it
        execSync(devCommand, { stdio: 'inherit' });
      }
    } else {
      // Start dev server for all audiences
      execSync(devCommand, { stdio: 'inherit' });
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Dev server failed to start'));
    console.error(error.message);
    process.exit(1);
  }
}
