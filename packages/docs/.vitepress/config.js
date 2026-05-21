import { defineConfig } from 'vitepress';

// EstreUV.js — standalone docs site. EstreUV-centric; references EstreUI
// where the pairing matters. (EstreUI has its own site; EstreUX covers both.)
export default defineConfig({
  title: 'EstreUV.js',
  description: 'Micro-Rimwork — a Lit class primitive, sister to EstreUI.js.',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,

  // Treat <estreuv-*> as custom elements so Vue's compiler leaves them
  // intact (they upgrade client-side once registered in theme/index.js).
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('estreuv-'),
      },
    },
  },

  markdown: {
    // mermaid-style live demo: an ```estreuv-demo fenced block renders the
    // markup live (registered custom elements) AND shows the source.
    config: (md) => {
      const fence = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info.trim() === 'estreuv-demo') {
          const raw = token.content;
          const asHtml = fence([{ ...token, info: 'html' }], 0, options, env, self);
          return `<div class="estreuv-demo">
  <div class="estreuv-demo__live">\n${raw}\n</div>
  <div class="estreuv-demo__code">${asHtml}</div>
</div>\n`;
        }
        return fence(tokens, idx, options, env, self);
      };
    },
  },

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Tiles', link: '/tiles' },
      { text: 'API', link: '/api/' },
      {
        text: '0.2.0',
        items: [
          { text: 'npm', link: 'https://www.npmjs.com/package/estreuv' },
          { text: 'Changelog', link: 'https://github.com/SoliEstre/EstreUV.js/blob/main/packages/estreuv/CHANGELOG.md' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is EstreUV?', link: '/guide/' },
            { text: 'Getting started', link: '/guide/getting-started' },
          ],
        },
        {
          text: 'Core',
          items: [
            { text: 'Components', link: '/guide/components' },
            { text: 'Lifecycle bridge', link: '/guide/lifecycle' },
            { text: 'Intent context', link: '/guide/intent' },
            { text: 'Alienese aliases', link: '/guide/aliases' },
          ],
        },
        {
          text: 'EstreUI',
          items: [{ text: 'Pairing with EstreUI', link: '/guide/pairing' }],
        },
      ],
      '/api/': [
        { text: 'API reference', link: '/api/' },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/SoliEstre/EstreUV.js' },
    ],

    footer: {
      message: 'MIT licensed',
      copyright: '© SoliEstre',
    },

    search: { provider: 'local' },
  },
});
