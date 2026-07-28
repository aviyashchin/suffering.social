import { defineConfig } from '@playwright/test';

const localBaseURL = 'http://127.0.0.1:4174';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || localBaseURL;
const target = new URL(baseURL);
const usesLocalPreview =
  ['127.0.0.1', 'localhost'].includes(target.hostname) &&
  target.port === '4174';

export default defineConfig({
  testDir: './tests/e2e',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: usesLocalPreview
    ? {
        command:
          'VITE_TELEMETRY_ENABLED=true VITE_GTM_ENABLED=true VITE_GTM_CONTAINER_ID=GTM-TEST123 npm run build && npx vite preview --host 127.0.0.1 --port 4174',
        url: localBaseURL,
        reuseExistingServer: false,
      }
    : undefined,
  projects: [
    {
      name: 'desktop-chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
