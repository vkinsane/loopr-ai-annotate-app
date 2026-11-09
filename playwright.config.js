import { defineConfig } from '@playwright/test'

const PORT = 4173

// Runs against the production build, because lazy-chunk tests need real chunks.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1440, height: 900 },
    // Playwright hides scroll bars by default; the scroll bar tests need them.
    launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'], ignoreDefaultArgs: ['--hide-scrollbars'] },
  },
  webServer: { command: `npm run build && npx vite preview --port ${PORT} --strictPort`, port: PORT, reuseExistingServer: false },
})
