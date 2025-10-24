# Auto-Docs 📚

> AI-powered multi-audience documentation generator for your codebase

[![npm version](https://img.shields.io/npm/v/@your-name/auto-docs.svg)](https://www.npmjs.com/package/@your-name/auto-docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Auto-Docs automatically generates beautiful, multi-audience documentation from your code changes using AI. Supports **Mintlify**, **Docusaurus**, and **VitePress**.

## ✨ Features

- 🤖 **AI-Powered**: Uses OpenRouter, OpenAI, or Anthropic to generate intelligent documentation
- 🎯 **Multi-Audience**: Create separate docs for developers, stakeholders, and end-users
- 🎨 **Multiple Frameworks**: Choose between Mintlify, Docusaurus, or VitePress
- 🔄 **Automatic**: GitHub Actions integration for automatic doc updates
- 💰 **Free Options**: Supports free AI models via OpenRouter
- 🚀 **Easy Setup**: Interactive CLI wizard

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Framework Comparison](#framework-comparison)
- [Usage](#usage)
- [Configuration](#configuration)
- [GitHub Actions](#github-actions)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Installation

```bash
npm install -D @your-name/auto-docs
```

Or use directly with npx:

```bash
npx @your-name/auto-docs init
```

## ⚡ Quick Start

### 1. Initialize in your project

```bash
npx auto-docs init
```

The interactive wizard will guide you through:
- Framework selection (Docusaurus, VitePress, or Mintlify)
- Audience configuration (Developer, Business, Customer)
- AI provider setup
- GitHub Actions configuration

### 2. Add your API key

Get a free API key from [OpenRouter](https://openrouter.ai) and add it to GitHub Secrets:

```
Repository → Settings → Secrets → Actions → New repository secret
Name: OPENROUTER_API_KEY
Value: your-api-key-here
```

### 3. Generate documentation

```bash
npx auto-docs generate
```

### 4. Preview documentation

```bash
npx auto-docs dev
```

That's it! 🎉

## 📊 Framework Comparison

| Feature | Mintlify | Docusaurus | VitePress |
|---------|----------|------------|-----------|
| **Cost** | Premium (paid) | ✅ Free | ✅ Free |
| **Hosting** | Cloud included | Self-host | Self-host |
| **Setup Time** | 2 min | 10 min | 5 min |
| **Customization** | Limited | ✅ Full (React) | ✅ Full (Vue) |
| **Build Speed** | N/A | Medium | ⚡ Very Fast |
| **Search** | Built-in | Algolia | Built-in |
| **Multi-Audience** | Tabs | Multi-instance | Multi-sidebar |
| **Deploy** | Mintlify Cloud | GitHub Pages, Vercel, Netlify | GitHub Pages, Vercel, Netlify |

### When to choose...

**Mintlify** - Quick setup, professional look, don't mind paying, want managed hosting
**Docusaurus** - Need maximum customization, React experience, large community
**VitePress** - Want blazing fast performance, Vue experience, minimal setup

## 📖 Usage

### CLI Commands

```bash
# Initialize auto-docs
npx auto-docs init [options]

# Generate documentation
npx auto-docs generate [options]

# Start dev server
npx auto-docs dev [audience]

# Validate configuration
npx auto-docs config --validate
```

### Options

#### `init`
```bash
npx auto-docs init \
  --framework docusaurus \
  --skip-install \
  --skip-git
```

#### `generate`
```bash
npx auto-docs generate \
  --audience developer \
  --force \
  --dry-run \
  --base-branch main
```

- `--audience <type>` - Target audience (developer, stakeholder, customer, all)
- `--force` - Regenerate all documentation
- `--dry-run` - Preview without writing files
- `--base-branch <branch>` - Base branch for comparison (default: main)

#### `dev`
```bash
npx auto-docs dev [audience] --port 3000
```

## ⚙️ Configuration

Auto-docs creates a `.doc-agent-config.json` file:

```json
{
  "framework": "docusaurus",

  "multiAudience": {
    "enabled": true,
    "audiences": ["developer", "stakeholder", "customer"]
  },

  "ai": {
    "provider": "openrouter",
    "model": "openai/gpt-4o-mini",
    "temperature": 0.3,
    "maxTokens": 4000
  },

  "documentation": {
    "docsPath": "docs",
    "format": "mdx",
    "language": "en"
  },

  "triggers": {
    "filePatterns": ["**/*.ts", "**/*.js", "**/*.py"],
    "excludePatterns": ["node_modules/**", "dist/**", "docs/**"]
  }
}
```

### Framework-Specific Configuration

**Docusaurus**: Edit `docusaurus.config.js` and `sidebars.js`
**VitePress**: Edit `.vitepress/config.js`
**Mintlify**: Edit `mint.json`

## 🔄 GitHub Actions

Auto-docs automatically creates GitHub Actions workflows. Enable them in your repository settings:

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **"Read and write permissions"**
3. Enable **"Allow GitHub Actions to create and approve pull requests"**
4. Save

The workflow will:
- Trigger on pull requests
- Analyze code changes
- Generate documentation with AI
- Commit updates to the PR

## 🎯 Multi-Audience Documentation

Auto-docs generates tailored documentation for different audiences:

### Developer
- Technical details and API references
- Code examples in multiple languages
- Implementation guides
- Performance and security notes

### Stakeholder
- Business value and impact
- High-level features
- Metrics and ROI
- Risk assessment

### Customer
- User-friendly tutorials
- Step-by-step guides
- FAQ and troubleshooting
- Common use cases

## 🌐 Deployment

### GitHub Pages (Free)

```bash
# Docusaurus
npm run build
npx gh-pages -d build

# VitePress
npm run docs:build
npx gh-pages -d docs/.vitepress/dist
```

### Vercel (Free)

```bash
vercel deploy
```

### Netlify (Free)

```bash
netlify deploy --prod
```

### Mintlify Cloud

Connect your repository at [mintlify.com](https://mintlify.com)

## 📄 License

MIT © [Your Name]

---

Made with ❤️ by [Your Name](https://your-website.com)
