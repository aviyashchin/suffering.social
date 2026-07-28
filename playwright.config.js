import { defineConfig } from '@playwright/test';

const localBaseURL = 'http://127.0.0.1:4174';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || localBaseURL;
const target = new URL(baseURL);
const usesLocalPreview =
  ['127.0.0.1', 'localhost'].includes(target.hostname) &&
  target.port === '4174';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: usesLocalPreview
    ? {
        command:
          'npm run build && npx vite preview --host 127.0.0.1 --port 4174',
        url: localBaseURL,
        reuseExistingServer: false,
      }
    : undefined,
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
});
