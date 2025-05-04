/**
 * @license
 * Copyright (c) 2025 Ronan LE MEILLAT for SCTG Development
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @file Vite plugin to enable SPA (Single Page Application) support for GitHub Pages
 * @author Ronan LE MEILLAT
 * @see {@link https://github.com/sctg-development/vite-plugin-github-pages-spa GitHub Repository}
 * @version 0.1.1
 */

import type { Plugin as VitePlugin, PluginOption, ResolvedConfig } from 'vite';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';


/**
 * Options for the GitHub Pages SPA plugin
 */
export interface GitHubPagesSpaOptions {
  /**
   * Whether to show warning messages in the console
   * @default true
   */
  verbose?: boolean;
  
  /**
   * Optional custom content for the 404.html file
   * If provided, it will be used instead of the default template
   */
  custom404Html?: string;
  
  /**
   * Whether to automatically add the script to index.html
   * @default true
   */
  injectScript?: boolean;
}

/**
 * Creates a Vite plugin that adds support for Single Page Applications on GitHub Pages
 * 
 * This plugin:
 * 1. Creates a 404.html file that redirects all requests to the index.html
 * 2. Injects a script into index.html that handles the redirect
 * 
 * @param options Configuration options for the plugin
 * @returns A Vite plugin
 */
export function githubPagesSpa(options: GitHubPagesSpaOptions = {}): any {
  const {
    verbose = true,
    injectScript = true,
    custom404Html
  } = options;
  
  let config: ResolvedConfig;
  
  return {
    name: 'vite-plugin-github-pages-spa',
    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig;
    },
    
    transformIndexHtml(html: string) {
      const isGitHubPages = config.base.includes('github.io') || config.base !== '/';
      
      if (!isGitHubPages || !injectScript) {
        if (verbose && !isGitHubPages) {
          console.warn('\nNot using GitHub Pages base URL. SPA redirection script not added.');
        }
        return html;
      }
      
      // If using GitHub Pages, add the redirection script
      if (verbose) {
        console.info('\nAdding GitHub Pages SPA redirection script to index.html');
      }
      
      return html.replace(
        /<head>/,
        `<head>
      <script type="text/javascript">
        // Single Page Apps Helper for GitHub Pages
        // MIT License
        // https://github.com/rafgraph/spa-github-pages
        (function(l) {
          if (l.search[1] === '/' ) {
            var decoded = l.search.slice(1).split('&').map(function(s) { 
              return s.replace(/~and~/g, '&')
            }).join('?');
            window.history.replaceState(null, null,
                l.pathname.slice(0, -1) + decoded + l.hash
            );
          }
        }(window.location))
      </script>`,
      );
    },
    
    closeBundle() {
      const isGitHubPages = config.base.includes('github.io') || config.base !== '/';
      
      if (!isGitHubPages) {
        return;
      }
      
      const distPath = resolve(config.root, config.build.outDir);
      
      if (!existsSync(distPath)) {
        mkdirSync(distPath, { recursive: true });
      }
      
      const urlBase = new URL(config.base.startsWith('http') 
        ? config.base 
        : `http://example.com${config.base}`);
      
      const urlPath = urlBase.pathname;
      const pathSegmentsToKeep = urlPath.split("/").filter(Boolean).length;
      
      let fileContent = custom404Html;
      
      if (!fileContent) {
        fileContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found</title>
    <script type="text/javascript">
        // Single Page Apps for GitHub Pages
        // MIT License
        // https://github.com/rafgraph/spa-github-pages
        var pathSegmentsToKeep = ${pathSegmentsToKeep}; // Number of path segments to keep in the URL

        var l = window.location;
        l.replace(
            l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
            l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
            l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
            (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
            l.hash
        );
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            text-align: center;
            color: #333;
        }
        h1 {
            margin-top: 50px;
            font-size: 24px;
        }
        p {
            margin: 20px 0;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <h1>Page Not Found</h1>
    <p>Redirecting to the home page...</p>
    <p><a href="/">Click here if you are not redirected automatically</a></p>
</body>
</html>`;
      }
      
      const filePath = resolve(distPath, "404.html");

      if (verbose) {
        console.info(`\nCreating 404.html in ${filePath} for GitHub Pages SPA support`);
      }

      // Write the file to the dist directory
      writeFileSync(filePath, fileContent);
    }
  };
}

// Default export for better compatibility
export default githubPagesSpa;