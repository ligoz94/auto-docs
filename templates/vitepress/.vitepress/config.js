import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Documentation',
  description: 'Auto-generated multi-audience documentation',
  base: '/',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Developers', link: '/developer/introduction' },
      { text: 'Business', link: '/stakeholder/introduction' },
      { text: 'Users', link: '/customer/introduction' }
    ],

    sidebar: {
      '/developer/': [
        {
          text: 'Developer Documentation',
          items: [
            { text: 'Introduction', link: '/developer/introduction' }
          ]
        }
      ],

      '/stakeholder/': [
        {
          text: 'Business Overview',
          items: [
            { text: 'Introduction', link: '/stakeholder/introduction' }
          ]
        }
      ],

      '/customer/': [
        {
          text: 'User Guide',
          items: [
            { text: 'Introduction', link: '/customer/introduction' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/your-project' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Your Company'
    },

    search: {
      provider: 'local'
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
