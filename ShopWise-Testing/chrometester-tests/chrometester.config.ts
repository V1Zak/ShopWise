import { defineConfig } from 'chrometester';

export default defineConfig({
  testDir: './tests',
  baseUrl: 'http://localhost:5173',
  browser: {
    headless: false,
    args: ['--no-sandbox'],
  },
  timeout: 60_000,
  workers: 1,
});
