# Vite Plugin: GitHub Pages SPA Support

A Vite plugin that enables seamless Single Page Application (SPA) support when hosting on GitHub Pages. GitHub Pages doesn't natively support SPAs, which can cause 404 errors when users refresh the page or navigate directly to a route. This plugin solves that problem by:

1. Creating a `404.html` file that redirects all requests to your SPA
2. Injecting a script in your `index.html` that handles the redirection

## Installation

```bash
npm install @sctg/vite-plugin-github-pages-spa --save-dev
# or
yarn add @sctg/vite-plugin-github-pages-spa --dev
# or
pnpm add @sctg/vite-plugin-github-pages-spa -D
```

## Usage

Add the plugin to your `vite.config.ts` or `vite.config.js`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // or any other framework plugin
import { githubPagesSpa } from "@sctg/vite-plugin-github-pages-spa";

export default defineConfig({
  // Set base if your repo isn't deployed at the root domain
  // For example, if your GitHub Pages URL is 'https://username.github.io/repo-name/'
  base: '/repo-name/',
  
  plugins: [
    react(),
    githubPagesSpa({
      // Options are optional
      verbose: true, // Set to false to disable console logs
    }),
  ],
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `verbose` | `boolean` | `true` | Whether to show log messages during build |
| `injectScript` | `boolean` | `true` | Whether to inject the redirection script into index.html |
| `custom404Html` | `string` | `undefined` | Optional custom HTML content for the 404.html file |

## How It Works

The plugin implements the [SPA GitHub Pages technique](https://github.com/rafgraph/spa-github-pages) by:

1. Adding a script to your `index.html` that checks for special query parameters and redirects correctly
2. Creating a `404.html` file that handles GitHub Pages 404 errors by redirecting to your index page with those special query parameters

## Credits

This plugin is based on the technique described by Rafael Pedicini at [spa-github-pages](https://github.com/rafgraph/spa-github-pages).

## License

MIT
