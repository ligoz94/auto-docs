import { loadConfig } from '../lib/config.js';
import { MintlifyGenerator } from '../lib/generators/mintlify.js';
import { DocusaurusGenerator } from '../lib/generators/docusaurus.js';
import { VitePressGenerator } from '../lib/generators/vitepress.js';
import ora from 'ora';
import chalk from 'chalk';

export async function generate(options) {
  const spinner = ora('Loading configuration...').start();

  try {
    const config = await loadConfig();

    spinner.text = 'Initializing generator...';

    let generator;
    switch (config.framework) {
      case 'mintlify':
        generator = new MintlifyGenerator(config);
        break;
      case 'docusaurus':
        generator = new DocusaurusGenerator(config);
        break;
      case 'vitepress':
        generator = new VitePressGenerator(config);
        break;
      default:
        spinner.fail(chalk.red(`Unknown framework: ${config.framework}`));
        process.exit(1);
    }

    spinner.text = 'Analyzing code changes...';
    const changes = await generator.analyze({
      baseBranch: options.baseBranch || 'main',
      force: options.force || false
    });

    if (!changes || changes.length === 0) {
      spinner.info(chalk.blue('No code changes detected'));
      return;
    }

    spinner.text = `Processing ${changes.length} file(s)...`;

    const audiences = options.audience && options.audience !== 'all'
      ? [options.audience]
      : config.multiAudience?.audiences || ['developer'];

    for (const audience of audiences) {
      spinner.text = `Generating docs for ${audience}...`;

      await generator.generate({
        audience,
        changes,
        dryRun: options.dryRun || false
      });
    }

    if (options.dryRun) {
      spinner.succeed(chalk.green('✅ Dry run completed (no files written)'));
    } else {
      spinner.succeed(chalk.green(`✅ Documentation generated for: ${audiences.join(', ')}`));

      console.log(chalk.bold('\n📋 Next steps:\n'));
      console.log(`  1. Review generated docs in ${chalk.cyan(`docs/`)}`);
      console.log(`  2. ${chalk.cyan('npx auto-docs dev')} to preview`);
      console.log(`  3. Commit and push to trigger GitHub Actions\n`);
    }

  } catch (error) {
    spinner.fail(chalk.red('❌ Generation failed'));
    console.error(error);
    process.exit(1);
  }
}
