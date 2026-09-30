import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        // The package's "main" names a CJS file it doesn't ship, so point resolution at
        // its ESM entry (what the browser build uses). src/test/setup.ts then mocks it.
        '@hugeicons/react': fileURLToPath(
          new URL('./node_modules/@hugeicons/react/dist/esm/hugeicons-react.js', import.meta.url),
        ),
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['src/test/setup.ts'],
    },
  }),
);
