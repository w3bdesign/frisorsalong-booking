import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        exclude: [
          // Config files
          '**/*.config.js',
          '**/*.config.ts',
          // Entry points
          'src/main.ts',
          // Test files
          '**/*.{test,spec}.{js,ts,jsx,tsx}',
          // Test directories
          '**/tests/**',
          '**/__tests__/**',
          // Cypress files
          'cypress/**',
          // Other files not needing coverage
          'env.d.ts',
          'src/assets/**',
          // Router (since it's just configuration)
          'src/router/**',
        ],
        include: ['src/components/**', 'src/stores/**', 'src/views/**'],
      },
    },
  }),
)
