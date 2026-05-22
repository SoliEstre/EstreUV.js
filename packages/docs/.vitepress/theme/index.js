import DefaultTheme from 'vitepress/theme';
import './custom.css';

// Register the EstreUV tile custom elements on the client so that
// ```estreuv-demo blocks render live. Browser-only (web components have
// no SSR); the markup is emitted during SSR and upgrades after hydration.
export default {
  extends: DefaultTheme,
  enhanceApp() {
    if (typeof window !== 'undefined') {
      import('estreuv/dark-mode-tile.js');
      import('estreuv/clock-tile.js');
      import('estreuv/notif-count-tile.js');
      import('estreuv/sidebar.js');
      import('estreuv/sidebar-item.js');
    }
  },
};
