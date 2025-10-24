/**
 * Main exports for auto-docs library
 */

export { loadConfig, validateConfig } from './config.js';
export { copyTemplates, installDependencies, createConfig } from './utils.js';
export { BaseGenerator } from './generators/base.js';
export { MintlifyGenerator } from './generators/mintlify.js';
export { DocusaurusGenerator } from './generators/docusaurus.js';
export { VitePressGenerator } from './generators/vitepress.js';
