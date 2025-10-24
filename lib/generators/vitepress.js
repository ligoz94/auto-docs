import { BaseGenerator } from './base.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

/**
 * VitePress-specific documentation generator
 */
export class VitePressGenerator extends BaseGenerator {
  /**
   * Format content for VitePress with custom containers
   * @param {string} content - Raw content
   * @param {Object} metadata - Page metadata
   * @returns {string} Formatted content
   */
  formatContent(content, metadata = {}) {
    let formatted = content;

    // Convert to VitePress containers
    formatted = formatted.replace(
      /⚠️\s*Warning:(.*?)(?=\n\n|\n#|$)/gs,
      '::: warning\n$1\n:::'
    );

    formatted = formatted.replace(
      /💡\s*Tip:(.*?)(?=\n\n|\n#|$)/gs,
      '::: tip\n$1\n:::'
    );

    formatted = formatted.replace(
      /ℹ️\s*Info:(.*?)(?=\n\n|\n#|$)/gs,
      '::: info\n$1\n:::'
    );

    formatted = formatted.replace(
      /❌\s*Danger:(.*?)(?=\n\n|\n#|$)/gs,
      '::: danger\n$1\n:::'
    );

    formatted = formatted.replace(
      /📝\s*Note:(.*?)(?=\n\n|\n#|$)/gs,
      '::: details Note\n$1\n:::'
    );

    // VitePress uses simple code groups
    formatted = this.formatCodeGroups(formatted);

    return formatted;
  }

  /**
   * Format code blocks into code groups
   * @param {string} content - Content with code blocks
   * @returns {string} Formatted content
   */
  formatCodeGroups(content) {
    // VitePress supports code groups with ::: code-group
    const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1],
        code: match[2],
        index: match.index,
        fullMatch: match[0]
      });
    }

    let result = content;
    let offset = 0;

    for (let i = 0; i < codeBlocks.length - 1; i++) {
      const current = codeBlocks[i];
      const next = codeBlocks[i + 1];

      if (next.index - (current.index + current.fullMatch.length) < 100) {
        const group = [current, next];

        while (
          i + group.length < codeBlocks.length &&
          codeBlocks[i + group.length].index -
            (codeBlocks[i + group.length - 1].index +
              codeBlocks[i + group.length - 1].fullMatch.length) <
            100
        ) {
          group.push(codeBlocks[i + group.length]);
        }

        // Create code-group
        const codeGroup = `::: code-group

${group.map(block => `\`\`\`${block.language} [${this.capitalizeFirst(block.language)}]
${block.code}\`\`\``).join('\n\n')}

:::`;

        const startIdx = current.index + offset;
        const endIdx = group[group.length - 1].index + group[group.length - 1].fullMatch.length + offset;

        result = result.substring(0, startIdx) + codeGroup + result.substring(endIdx);

        offset += codeGroup.length - (endIdx - startIdx);
        i += group.length - 1;
      }
    }

    return result;
  }

  /**
   * Update .vitepress/config.js configuration
   * @param {Array} pages - Generated pages
   * @param {string} audience - Target audience
   */
  async updateConfig(pages, audience) {
    const configPath = join(process.cwd(), '.vitepress', 'config.js');

    if (!existsSync(configPath)) {
      // Create default config
      this.createDefaultConfig(audience, pages);
      return;
    }

    try {
      let configContent = readFileSync(configPath, 'utf-8');

      // Find sidebar configuration
      // This is basic - VitePress configs can be complex
      const sidebarKey = `'/${audience}/'`;

      if (!configContent.includes(sidebarKey)) {
        // Add new sidebar section
        const newSidebar = `
      ${sidebarKey}: [
        {
          text: '${this.capitalizeFirst(audience)}',
          items: [
            ${pages.map(p => `{ text: '${p.title}', link: '/${audience}/${this.sanitizeFileName(p.title)}' }`).join(',\n            ')}
          ]
        }
      ],`;

        // Insert into sidebar object
        const sidebarMatch = configContent.match(/sidebar:\s*{/);
        if (sidebarMatch) {
          const insertIndex = sidebarMatch.index + sidebarMatch[0].length;
          configContent =
            configContent.substring(0, insertIndex) +
            newSidebar +
            configContent.substring(insertIndex);
        }
      }

      writeFileSync(configPath, configContent);
      console.log(chalk.gray('  ✓ Updated .vitepress/config.js'));

    } catch (error) {
      console.error(chalk.red('Error updating VitePress config:'), error.message);
    }
  }

  /**
   * Create default VitePress config
   * @param {string} audience - Target audience
   * @param {Array} pages - Generated pages
   */
  createDefaultConfig(audience, pages) {
    const configDir = join(process.cwd(), '.vitepress');
    const configPath = join(configDir, 'config.js');

    const config = `import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Documentation',
  description: 'Auto-generated documentation',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: '${this.capitalizeFirst(audience)}', link: '/${audience}/introduction' }
    ],

    sidebar: {
      '/${audience}/': [
        {
          text: '${this.capitalizeFirst(audience)}',
          items: [
            ${pages.map(p => `{ text: '${p.title}', link: '/${audience}/${this.sanitizeFileName(p.title)}' }`).join(',\n            ')}
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo' }
    ]
  }
})
`;

    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }

    writeFileSync(configPath, config);
    console.log(chalk.gray('  ✓ Created .vitepress/config.js'));
  }

  /**
   * Generate navigation structure for VitePress
   * @param {Array} pages - Pages to add to navigation
   * @returns {Array} Navigation structure
   */
  generateNavigation(pages) {
    return pages.map(page => ({
      text: page.title,
      link: this.sanitizeFileName(page.title)
    }));
  }

  /**
   * Parse documentation into structured pages
   * @param {string} documentation - Raw documentation
   * @param {string} audience - Target audience
   * @returns {Array} Array of page objects
   */
  parseDocumentation(documentation, audience) {
    const sections = documentation.split(/^# /m).filter(Boolean);

    const pages = sections.map(section => {
      const lines = section.split('\n');
      const title = lines[0].trim();
      const content = '# ' + section;

      return {
        title,
        content: this.formatContent(content),
        audience,
        description: this.extractDescription(content)
      };
    });

    if (pages.length === 0) {
      return [{
        title: 'Documentation Update',
        content: this.formatContent(documentation),
        audience,
        description: 'Auto-generated documentation'
      }];
    }

    return pages;
  }

  /**
   * Extract description from content
   * @param {string} content - Page content
   * @returns {string} Description
   */
  extractDescription(content) {
    const lines = content.split('\n');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#')) {
        return line.substring(0, 160);
      }
    }
    return 'Auto-generated documentation';
  }

  /**
   * Capitalize first letter
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
