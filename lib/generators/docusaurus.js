import { BaseGenerator } from './base.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

/**
 * Docusaurus-specific documentation generator
 */
export class DocusaurusGenerator extends BaseGenerator {
  /**
   * Format content for Docusaurus with Admonitions
   * @param {string} content - Raw content
   * @param {Object} metadata - Page metadata
   * @returns {string} Formatted content
   */
  formatContent(content, metadata = {}) {
    let formatted = content;

    // Convert to Docusaurus admonitions
    formatted = formatted.replace(
      /⚠️\s*Warning:(.*?)(?=\n\n|\n#|$)/gs,
      ':::warning\n$1\n:::'
    );

    formatted = formatted.replace(
      /💡\s*Tip:(.*?)(?=\n\n|\n#|$)/gs,
      ':::tip\n$1\n:::'
    );

    formatted = formatted.replace(
      /ℹ️\s*Info:(.*?)(?=\n\n|\n#|$)/gs,
      ':::info\n$1\n:::'
    );

    formatted = formatted.replace(
      /⚠️\s*Caution:(.*?)(?=\n\n|\n#|$)/gs,
      ':::caution\n$1\n:::'
    );

    formatted = formatted.replace(
      /❌\s*Danger:(.*?)(?=\n\n|\n#|$)/gs,
      ':::danger\n$1\n:::'
    );

    // Convert code groups to tabs
    formatted = this.formatCodeTabs(formatted);

    return formatted;
  }

  /**
   * Format code blocks into Tabs for multiple languages
   * @param {string} content - Content with code blocks
   * @returns {string} Formatted content
   */
  formatCodeTabs(content) {
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

        // Create Tabs component
        const tabs = `import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
${group.map(block => `  <TabItem value="${block.language}" label="${this.capitalizeFirst(block.language)}">

\`\`\`${block.language}
${block.code}\`\`\`

  </TabItem>`).join('\n')}
</Tabs>`;

        const startIdx = current.index + offset;
        const endIdx = group[group.length - 1].index + group[group.length - 1].fullMatch.length + offset;

        result = result.substring(0, startIdx) + tabs + result.substring(endIdx);

        offset += tabs.length - (endIdx - startIdx);
        i += group.length - 1;
      }
    }

    return result;
  }

  /**
   * Update docusaurus.config.cjs and sidebars.js
   * @param {Array} pages - Generated pages
   * @param {string} audience - Target audience
   */
  async updateConfig(pages, audience) {
    await this.updateSidebar(pages, audience);
  }

  /**
   * Update sidebars.js configuration
   * @param {Array} pages - Generated pages
   * @param {string} audience - Target audience
   */
  async updateSidebar(pages, audience) {
    const sidebarPath = join(process.cwd(), 'sidebars.js');

    if (!existsSync(sidebarPath)) {
      // Create default sidebars.js
      this.createDefaultSidebar(audience, pages);
      return;
    }

    try {
      let sidebarContent = readFileSync(sidebarPath, 'utf-8');

      // Parse sidebar structure (basic parsing, can be improved)
      const audienceKey = `${audience}Sidebar`;

      // Check if audience sidebar exists
      if (!sidebarContent.includes(audienceKey)) {
        // Add new sidebar
        const newSidebar = `
  ${audienceKey}: [
    {
      type: 'category',
      label: '${this.capitalizeFirst(audience)}',
      items: [${pages.map(p => `'${audience}/${this.sanitizeFileName(p.title)}'`).join(', ')}],
    },
  ],`;

        // Insert before closing brace
        sidebarContent = sidebarContent.replace(
          /};(\s*)$/,
          `,${newSidebar}\n};$1`
        );
      } else {
        // Update existing sidebar - simple append for now
        console.log(chalk.yellow('Sidebar exists, manual update may be needed'));
      }

      writeFileSync(sidebarPath, sidebarContent);
      console.log(chalk.gray('  ✓ Updated sidebars.js'));

    } catch (error) {
      console.error(chalk.red('Error updating sidebars.js:'), error.message);
    }
  }

  /**
   * Create default sidebars.js
   * @param {string} audience - Target audience
   * @param {Array} pages - Generated pages
   */
  createDefaultSidebar(audience, pages) {
    const sidebarPath = join(process.cwd(), 'sidebars.js');

    const content = `module.exports = {
  ${audience}Sidebar: [
    {
      type: 'category',
      label: '${this.capitalizeFirst(audience)}',
      items: [${pages.map(p => `'${audience}/${this.sanitizeFileName(p.title)}'`).join(', ')}],
    },
  ],
};
`;

    writeFileSync(sidebarPath, content);
    console.log(chalk.gray('  ✓ Created sidebars.js'));
  }

  /**
   * Generate navigation structure for Docusaurus
   * @param {Array} pages - Pages to add to navigation
   * @returns {Array} Navigation structure
   */
  generateNavigation(pages) {
    return pages.map(page => ({
      type: 'doc',
      id: this.sanitizeFileName(page.title),
      label: page.title
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
