import { BaseGenerator } from './base.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

/**
 * Mintlify-specific documentation generator
 */
export class MintlifyGenerator extends BaseGenerator {
  /**
   * Format content for Mintlify with MDX components
   * @param {string} content - Raw content
   * @param {Object} metadata - Page metadata
   * @returns {string} Formatted content
   */
  formatContent(content, metadata = {}) {
    // Mintlify supports special components
    let formatted = content;

    // Convert warnings
    formatted = formatted.replace(
      /⚠️\s*Warning:(.*?)(?=\n\n|\n#|$)/gs,
      '<Warning>$1</Warning>'
    );

    // Convert tips
    formatted = formatted.replace(
      /💡\s*Tip:(.*?)(?=\n\n|\n#|$)/gs,
      '<Tip>$1</Tip>'
    );

    // Convert info blocks
    formatted = formatted.replace(
      /ℹ️\s*Info:(.*?)(?=\n\n|\n#|$)/gs,
      '<Info>$1</Info>'
    );

    // Convert code groups if multiple language examples exist
    formatted = this.formatCodeGroups(formatted);

    return formatted;
  }

  /**
   * Format code blocks into CodeGroup if multiple languages
   * @param {string} content - Content with code blocks
   * @returns {string} Formatted content
   */
  formatCodeGroups(content) {
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

    // Group consecutive code blocks
    let result = content;
    let offset = 0;

    for (let i = 0; i < codeBlocks.length - 1; i++) {
      const current = codeBlocks[i];
      const next = codeBlocks[i + 1];

      // Check if blocks are close together (within 100 chars)
      if (next.index - (current.index + current.fullMatch.length) < 100) {
        const group = [current, next];

        // Collect all consecutive blocks
        while (
          i + group.length < codeBlocks.length &&
          codeBlocks[i + group.length].index -
            (codeBlocks[i + group.length - 1].index +
              codeBlocks[i + group.length - 1].fullMatch.length) <
            100
        ) {
          group.push(codeBlocks[i + group.length]);
        }

        // Create CodeGroup
        const codeGroup = `<CodeGroup>
${group.map(block => `\`\`\`${block.language}
${block.code}\`\`\``).join('\n\n')}
</CodeGroup>`;

        // Replace in content
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
   * Update mint.json configuration
   * @param {Array} pages - Generated pages
   * @param {string} audience - Target audience
   */
  async updateConfig(pages, audience) {
    const mintJsonPath = join(process.cwd(), 'mint.json');

    if (!existsSync(mintJsonPath)) {
      console.log(chalk.yellow('mint.json not found, skipping navigation update'));
      return;
    }

    try {
      const mintConfig = JSON.parse(readFileSync(mintJsonPath, 'utf-8'));

      // Find or create navigation group for this audience
      let audienceGroup = mintConfig.navigation?.find(
        group => group.group.toLowerCase() === audience.toLowerCase()
      );

      if (!audienceGroup) {
        audienceGroup = {
          group: this.capitalizeFirst(audience),
          pages: []
        };
        mintConfig.navigation = mintConfig.navigation || [];
        mintConfig.navigation.push(audienceGroup);
      }

      // Add new pages to navigation
      for (const page of pages) {
        const pagePath = `docs/${audience}/${this.sanitizeFileName(page.title)}`;

        if (!audienceGroup.pages.includes(pagePath)) {
          audienceGroup.pages.push(pagePath);
        }
      }

      // Write updated config
      writeFileSync(mintJsonPath, JSON.stringify(mintConfig, null, 2));
      console.log(chalk.gray('  ✓ Updated mint.json navigation'));

    } catch (error) {
      console.error(chalk.red('Error updating mint.json:'), error.message);
    }
  }

  /**
   * Generate navigation structure for Mintlify
   * @param {Array} pages - Pages to add to navigation
   * @returns {Object} Navigation structure
   */
  generateNavigation(pages) {
    return pages.map(page => ({
      title: page.title,
      path: this.sanitizeFileName(page.title)
    }));
  }

  /**
   * Capitalize first letter
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Parse documentation into structured pages
   * @param {string} documentation - Raw documentation
   * @param {string} audience - Target audience
   * @returns {Array} Array of page objects
   */
  parseDocumentation(documentation, audience) {
    // Split by # headers to create separate pages
    const sections = documentation.split(/^# /m).filter(Boolean);

    const pages = sections.map(section => {
      const lines = section.split('\n');
      const title = lines[0].trim();
      const content = '# ' + section; // Re-add header

      return {
        title,
        content: this.formatContent(content),
        audience,
        description: this.extractDescription(content)
      };
    });

    // If no sections found, return single page
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
    // Get first paragraph after title
    const lines = content.split('\n');
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#')) {
        return line.substring(0, 160); // Limit to 160 chars
      }
    }
    return 'Auto-generated documentation';
  }
}
