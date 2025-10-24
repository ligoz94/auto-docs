import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { join } from 'path';
import { copyTemplates, installDependencies, createConfig } from '../lib/utils.js';

export async function init(options) {
  console.log(chalk.bold.blue('\n📚 Auto-Docs Setup Wizard\n'));

  // Check if already initialized
  if (existsSync('.doc-agent-config.json')) {
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: 'Auto-docs is already initialized. Overwrite configuration?',
      default: false
    }]);

    if (!overwrite) {
      console.log(chalk.yellow('\n⚠️  Setup cancelled\n'));
      return;
    }
  }

  // Interactive prompts
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Quale framework di documentazione vuoi usare?',
      choices: [
        {
          name: '📘 Docusaurus (gratuito, versatile, React-based)',
          value: 'docusaurus',
          short: 'Docusaurus'
        },
        {
          name: '⚡ VitePress (gratuito, velocissimo, Vue-based)',
          value: 'vitepress',
          short: 'VitePress'
        },
        {
          name: '✨ Mintlify (premium, cloud hosting, setup rapido)',
          value: 'mintlify',
          short: 'Mintlify'
        }
      ],
      default: 'docusaurus',
      when: !options.framework
    },
    {
      type: 'confirm',
      name: 'multiAudience',
      message: 'Vuoi documentazione multi-audience?',
      default: true
    },
    {
      type: 'checkbox',
      name: 'audiences',
      message: 'Seleziona le audience da supportare:',
      when: (answers) => answers.multiAudience,
      choices: [
        {
          name: '👨‍💻 Developer (technical docs, API reference)',
          value: 'developer',
          checked: true
        },
        {
          name: '💼 Business/Stakeholder (high-level overview, metrics)',
          value: 'stakeholder',
          checked: true
        },
        {
          name: '👤 End User/Customer (guides, tutorials)',
          value: 'customer',
          checked: true
        }
      ],
      validate: (input) => {
        return input.length > 0 || 'Seleziona almeno una audience';
      }
    },
    {
      type: 'list',
      name: 'aiProvider',
      message: 'Quale AI provider vuoi usare?',
      choices: [
        {
          name: 'OpenRouter (supporta modelli gratuiti)',
          value: 'openrouter'
        },
        {
          name: 'OpenAI (richiede API key a pagamento)',
          value: 'openai'
        },
        {
          name: 'Anthropic Claude (richiede API key)',
          value: 'anthropic'
        }
      ],
      default: 'openrouter'
    },
    {
      type: 'input',
      name: 'aiModel',
      message: 'Modello AI da usare:',
      default: (answers) => {
        if (answers.aiProvider === 'openrouter') {
          return 'openai/gpt-4o-mini';
        } else if (answers.aiProvider === 'openai') {
          return 'gpt-4o-mini';
        } else {
          return 'claude-3-haiku';
        }
      }
    },
    {
      type: 'list',
      name: 'deploy',
      message: 'Dove vuoi fare il deploy della documentazione?',
      choices: [
        {
          name: 'GitHub Pages (gratuito, automatico)',
          value: 'github-pages'
        },
        {
          name: 'Vercel (gratuito, veloce)',
          value: 'vercel'
        },
        {
          name: 'Netlify (gratuito)',
          value: 'netlify'
        },
        {
          name: 'Nessuno (gestirò manualmente)',
          value: 'none'
        }
      ],
      when: (answers) => (answers.framework || options.framework) !== 'mintlify',
      default: 'github-pages'
    },
    {
      type: 'confirm',
      name: 'setupGitHubActions',
      message: 'Configurare GitHub Actions per documentazione automatica?',
      default: true,
      when: !options.skipGit
    }
  ]);

  const framework = options.framework || answers.framework;

  const spinner = ora('Configurazione in corso...').start();

  try {
    // Create configuration
    await createConfig({
      framework,
      ...answers
    });

    spinner.text = 'Copia template files...';
    // Copy framework-specific templates
    await copyTemplates(framework, answers);

    spinner.text = 'Installazione dipendenze...';
    if (!options.skipInstall) {
      await installDependencies(framework);
    }

    spinner.succeed(chalk.green('✅ Configurazione completata!\n'));

    // Show next steps
    console.log(chalk.bold('📋 Prossimi passi:\n'));

    if (options.skipInstall) {
      console.log(`  1. ${chalk.cyan('npm install')}`);
    }

    if (answers.setupGitHubActions) {
      console.log(`  ${options.skipInstall ? '2' : '1'}. Vai su GitHub → Settings → Secrets → Actions`);
      console.log(`  ${options.skipInstall ? '3' : '2'}. Aggiungi secret ${chalk.yellow('OPENROUTER_API_KEY')} con la tua API key`);
      console.log(`  ${options.skipInstall ? '4' : '3'}. Abilita "Allow GitHub Actions to create PRs" in Settings → Actions → General`);
    }

    console.log(`  ${answers.setupGitHubActions ? (options.skipInstall ? '5' : '4') : (options.skipInstall ? '2' : '1')}. ${chalk.cyan('npx auto-docs generate')} per generare documentazione`);
    console.log(`  ${answers.setupGitHubActions ? (options.skipInstall ? '6' : '5') : (options.skipInstall ? '3' : '2')}. ${chalk.cyan('npx auto-docs dev')} per avviare il dev server\n`);

    if (framework === 'mintlify') {
      console.log(chalk.blue('💡 Per Mintlify, dovrai anche configurare il deploy su mintlify.com'));
    } else if (answers.deploy === 'github-pages') {
      console.log(chalk.blue('💡 GitHub Pages sarà configurato automaticamente al primo push'));
    }

    console.log();

  } catch (error) {
    spinner.fail(chalk.red('❌ Errore durante il setup'));
    console.error(error);
    process.exit(1);
  }
}
