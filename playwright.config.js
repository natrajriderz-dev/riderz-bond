// playwright.config.js
module.exports = {
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx expo start --web',
    port: 8081,
    reuseExistingServer: true,
  },
};
