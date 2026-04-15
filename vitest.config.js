import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['js/**/*.js'],
      exclude: [
        'js/sarabun-font.js',
        'js/modules/lazy-loader.js',
        'js/locales/**',
        '**/node_modules/**',
        'tests/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': '/js',
      '@utils': '/js/utils.js',
      '@config': '/js/config.js'
    }
  }
})
