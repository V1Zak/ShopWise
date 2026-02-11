import { defineConfig } from 'chrometester';

export default defineConfig({
  testDir: 'tests',
  baseUrl: 'http://localhost:5173',
  headless: false, // Show browser for recording
  workers: 1, // Run sequentially for recording
  timeout: 60000, // 60 seconds per test
  reporters: ['terminal', 'html'],
  screenshots: {
    enabled: true,
    onFailure: true,
    onSuccess: true,
  },
  video: {
    enabled: true, // Record all tests
    dir: 'recordings',
  },
  performance: {
    lighthouse: { enabled: true, runs: 1 },
    webVitals: { enabled: true },
  },
});
